import fs from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { BSON, Long } from "mongodb";
import { getMysqlPool } from "../db/mysql.js";
import { getMongoDatabase } from "../db/mongodb.js";
import { projectionRepository } from "../repositories/projection.repository.js";
import { PROJECTIONS, PROJECTION_CONTROL, projectionEnabled } from "./projection-schema.js";
import { getProjector, projectionFault } from "./projections.js";
import { decimalId, safeSyncError, syncSource } from "./documents.js";
const concern = { w: "majority", wtimeoutMS: 10000 };
const digest = rows => createHash("sha256").update(BSON.EJSON.stringify(rows, { relaxed: false })).digest("hex");
export async function projectionPreflight() {
  const approved = JSON.parse(await fs.readFile(".artifacts/projection-approved-preflight.json", "utf8"));
  const baseline = JSON.parse(await fs.readFile(".artifacts/phase3f-extension-baseline.json", "utf8"));
  const pool = getMysqlPool(), mongo = await getMongoDatabase();
  if ((await pool.query("SELECT DATABASE() name"))[0][0].name !== "organsync_v2" || mongo.databaseName !== "organsync_v2_logs") throw projectionFault("PROJECTION_SCOPE_CONFLICT");
  const [metadata] = await pool.query("SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_KEY,EXTRA,GENERATION_EXPRESSION FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME,ORDINAL_POSITION");
  const [triggers] = await pool.query("SELECT TRIGGER_NAME,ACTION_TIMING,EVENT_MANIPULATION,EVENT_OBJECT_TABLE,ACTION_STATEMENT FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const [procedures] = await pool.query("SELECT ROUTINE_NAME,ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() ORDER BY ROUTINE_NAME");
  if (JSON.stringify(metadata) !== JSON.stringify(approved.metadata) || digest(triggers) !== baseline.triggers || digest(procedures) !== baseline.procedures) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
  return approved;
}
async function controlCollection(db) {
  const title = "OrganSync projection checkpoints v1";
  let existing = (await db.listCollections({ name: PROJECTION_CONTROL }).toArray())[0];
  if (!existing) {
    try { await db.createCollection(PROJECTION_CONTROL, { validator: { $jsonSchema: { title, bsonType: "object", required: ["source", "mode"], additionalProperties: false,
      properties: { _id: { bsonType: "string" }, source: { bsonType: "string" }, mode: { enum: ["backfill", "reconcile"] }, state: { enum: ["running", "completed", "failed"] }, generation: { bsonType: ["long", "int", "double"] }, owner: { bsonType: "string" }, lease_until: { bsonType: "date" }, progress: { bsonType: "object" }, error: { bsonType: ["string", "null"] }, updated_at: { bsonType: "date" }, completed_at: { bsonType: "date" } } } }, writeConcern: concern }); }
    catch (error) { if (error.code !== 48) throw error; }
    existing = (await db.listCollections({ name: PROJECTION_CONTROL }).toArray())[0];
  }
  if (existing?.type !== "collection" || existing.options?.validator?.$jsonSchema?.title !== title) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
  return db.collection(PROJECTION_CONTROL);
}
export async function runProjectionJob(mode, { approveBackfill = false, projector: injectedProjector } = {}) {
  if (!projectionEnabled() || !["backfill", "reconcile"].includes(mode) || (mode === "backfill" && !approveBackfill)) throw projectionFault("PROJECTION_DISABLED");
  const approved = await projectionPreflight(), db = await getMongoDatabase(), pool = getMysqlPool(), source = syncSource();
  const jobId = `${source}:${mode}:v1`, prior = await db.collection(PROJECTION_CONTROL).findOne({ _id: jobId });
  if (mode === "backfill" && prior?.state === "completed") return { mode, state: "completed", alreadyCompleted: true };
  if (mode === "backfill" && !prior) {
    for (const table of Object.keys(PROJECTIONS)) if (JSON.stringify(await projectionRepository.ids(pool, table, "0", 500)) !== JSON.stringify(approved.manifest[table])) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
    if (Object.values(approved.manifest).reduce((n, ids) => n + ids.length, 0) !== 39) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
  }
  // Validate every target namespace before creating any collection.
  for (const mapping of Object.values(PROJECTIONS)) {
    const found = (await db.listCollections({ name: mapping.collection }).toArray())[0];
    if (found && (found.type !== "collection" || found.options?.validator?.$jsonSchema?.title !== "OrganSync business projection v1")) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
  }
  const col = await controlCollection(db), owner = randomUUID(); let job;
  try {
    await col.updateOne({ _id: jobId, source, mode }, { $setOnInsert: { source, mode, state: "running", progress: {}, generation: Long.ZERO } }, { upsert: true, writeConcern: concern });
    job = await col.findOneAndUpdate({ _id: jobId, source, mode, $or: [{ lease_until: { $exists: false } }, { $expr: { $lte: ["$lease_until", "$$NOW"] } }] },
      [{ $set: { source, mode, owner, state: "running", error: null, generation: { $add: [{ $ifNull: ["$generation", Long.ZERO] }, Long.ONE] },
        progress: mode === "reconcile" ? { $cond: [{ $eq: ["$state", "completed"] }, {}, { $ifNull: ["$progress", {}] }] } : { $ifNull: ["$progress", {}] }, lease_until: { $add: ["$$NOW", 60000] }, updated_at: "$$NOW" } }],
      { returnDocument: "after", writeConcern: concern });
    if (!job) throw projectionFault("PROJECTION_BUSY");
  } catch (error) { if (error.code === 11000) throw projectionFault("PROJECTION_BUSY"); throw error; }
  const fence = { _id: jobId, owner, generation: job.generation, $expr: { $gt: ["$lease_until", "$$NOW"] } };
  const progress = job.progress || {};
  async function checkpoint() {
    const result = await col.updateOne(fence, [{ $set: { progress: { $literal: progress }, lease_until: { $add: ["$$NOW", 60000] }, updated_at: "$$NOW" } }], { writeConcern: concern });
    if (result.matchedCount !== 1) throw projectionFault("PROJECTION_FENCED");
  }
  const projector = injectedProjector || getProjector();
  try {
    await projector.ensureAll();
    for (const [table, mapping] of Object.entries(PROJECTIONS)) {
      const p = progress[table] ||= { last_id: "0", processed: 0, source_done: false, sweep_after: "", done: false };
      if (p.done) continue;
      while (!p.source_done) {
        const ids = mode === "backfill" ? approved.manifest[table].filter(id => BigInt(id) > BigInt(p.last_id)).slice(0, 100) : await projectionRepository.ids(pool, table, p.last_id);
        if (!ids.length) { p.source_done = true; await checkpoint(); break; }
        for (const id of ids) { await checkpoint(); await projector.refresh(table, id, pool); p.last_id = id; p.processed++; await checkpoint(); }
      }
      if (mode === "reconcile") {
        // Sweep only owned projection IDs. Every candidate gets a fresh source lookup;
        // absence from a paginated source scan alone never creates a tombstone.
        while (true) {
          const docs = await db.collection(mapping.collection).find({ source, _id: { $gt: p.sweep_after } }, { projection: { _id: 1, source_id: 1 } }).sort({ _id: 1 }).limit(100).toArray();
          if (!docs.length) break;
          for (const doc of docs) { decimalId(doc.source_id); await checkpoint(); await projector.refresh(table, doc.source_id, pool); p.sweep_after = doc._id; await checkpoint(); }
        }
      }
      p.done = true; await checkpoint();
    }
    const finished = await col.updateOne(fence, { $set: { state: "completed", progress, error: null }, $currentDate: { updated_at: true, completed_at: true }, $unset: { owner: "", lease_until: "" } }, { writeConcern: concern });
    if (finished.matchedCount !== 1) throw projectionFault("PROJECTION_FENCED");
    return { mode, state: "completed", recordsVisited: Object.values(progress).reduce((n, p) => n + p.processed, 0) };
  } catch (error) {
    await col.updateOne(fence, { $set: { state: "failed", error: safeSyncError(error), progress }, $currentDate: { updated_at: true }, $unset: { owner: "", lease_until: "" } }, { writeConcern: concern }).catch(() => {});
    throw error;
  }
}
