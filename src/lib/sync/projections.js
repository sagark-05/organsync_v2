import { randomUUID } from "node:crypto";
import { Long } from "mongodb";
import { getMongoDatabase } from "../db/mongodb.js";
import { getMysqlPool } from "../db/mysql.js";
import { projectionRepository } from "../repositories/projection.repository.js";
import { decimalId, syncSource } from "./documents.js";
import { PROJECTIONS, PROJECTION_CONTROL, projectionData, projectionHash, projectionId, projectionSpec, projectionValidator } from "./projection-schema.js";
export const projectionFault = syncCode => Object.assign(new Error("Business projection operation was not confirmed."), { syncCode });
const concern = { w: "majority", wtimeoutMS: 10000 };
export function createProjector({ database = getMongoDatabase, repository = projectionRepository, source = syncSource(), leaseMs = 30000 } = {}) {
  if (!Number.isInteger(leaseMs) || leaseMs < 10 || leaseMs > 120000) throw new Error("Invalid projection lease.");
  const ensured = new Set();
  async function collection(table) {
    const mapping = projectionSpec(table), db = await database();
    if (!ensured.has(table)) {
      let existing = (await db.listCollections({ name: mapping.collection }).toArray())[0];
      if (!existing) {
        try { await db.createCollection(mapping.collection, { validator: projectionValidator(table), validationLevel: "strict", writeConcern: concern }); }
        catch (error) { if (error.code !== 48) throw error; }
        existing = (await db.listCollections({ name: mapping.collection }).toArray())[0];
      }
      if (existing?.type !== "collection" || JSON.stringify(existing.options?.validator) !== JSON.stringify(projectionValidator(table))) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
      await db.collection(mapping.collection).createIndex({ source: 1, "_sync.state": 1 }, { name: "projection_source_state" });
      ensured.add(table);
    }
    return db.collection(mapping.collection);
  }
  return {
    async ensureAll() { for (const table of Object.keys(PROJECTIONS)) await collection(table); },
    async claim(table, value) {
      const id = decimalId(value), col = await collection(table), owner = randomUUID();
      try {
        await col.updateOne({ _id: projectionId(table, id, source), source, table, schema_version: 1, source_id: id },
          { $setOnInsert: { source, table, source_id: id, schema_version: 1, data: null, _sync: { generation: Long.ZERO, state: "initializing", deleted: false } } }, { upsert: true, writeConcern: concern });
        const doc = await col.findOneAndUpdate({ _id: projectionId(table, id, source), source, table, schema_version: 1,
          $or: [{ "_sync.lease_until": { $exists: false } }, { $expr: { $lte: ["$_sync.lease_until", "$$NOW"] } }] },
        [{ $set: { source, table, source_id: id, schema_version: 1, data: { $ifNull: ["$data", null] }, "_sync.state": { $ifNull: ["$_sync.state", "initializing"] },
          "_sync.deleted": { $ifNull: ["$_sync.deleted", false] }, "_sync.generation": { $add: [{ $ifNull: ["$_sync.generation", Long.ZERO] }, Long.ONE] }, "_sync.owner": owner, "_sync.lease_until": { $add: ["$$NOW", leaseMs] } } }],
        { returnDocument: "after", writeConcern: concern, maxTimeMS: 10000 });
        if (!doc) throw projectionFault("PROJECTION_BUSY");
        return { table, id, owner, generation: doc._sync.generation };
      } catch (error) {
        if (error.code !== 11000) throw error;
        const actual = await col.findOne({ _id: projectionId(table, id, source) }, { projection: { source: 1, table: 1, schema_version: 1 } });
        if (actual?.source !== source || actual?.table !== table || actual?.schema_version !== 1) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
        throw projectionFault("PROJECTION_BUSY");
      }
    },
    async publish(claim, row, eventId = null) {
      const col = await collection(claim.table), data = projectionData(claim.table, row), hash = projectionHash(data);
      if (data && data[projectionSpec(claim.table).pk] !== claim.id) throw projectionFault("PROJECTION_SCOPE_CONFLICT");
      const result = await col.updateOne({ _id: projectionId(claim.table, claim.id, source), source, "_sync.owner": claim.owner, "_sync.generation": claim.generation,
        $expr: { $gt: ["$_sync.lease_until", "$$NOW"] } },
      { $set: { data, "_sync.deleted": data === null, "_sync.state": data === null ? "deleted" : "ready", "_sync.content_sha256": hash, "_sync.last_event_id": eventId === null ? null : decimalId(eventId) },
        $currentDate: { "_sync.updated_at": true }, $unset: { "_sync.owner": "", "_sync.lease_until": "" } }, { writeConcern: concern, maxTimeMS: 10000 });
      if (!result.acknowledged || result.matchedCount !== 1) throw projectionFault("PROJECTION_FENCED");
      const confirmed = await col.findOne({ _id: projectionId(claim.table, claim.id, source) }, { readConcern: { level: "majority" }, maxTimeMS: 10000 });
      // Another claimant may already have refreshed the same current source. Do not overwrite it.
      if (!confirmed || (String(confirmed._sync.generation) === String(claim.generation) && (confirmed._sync.content_sha256 !== hash || JSON.stringify(confirmed.data) !== JSON.stringify(data)))) throw projectionFault("PROJECTION_NOT_CONFIRMED");
      return { table: claim.table, source_id: claim.id, deleted: data === null };
    },
    async refresh(table, id, db = getMysqlPool(), eventId = null) {
      const claim = await this.claim(table, id);
      try { return await this.publish(claim, await repository.read(db, table, id), eventId); }
      catch (error) {
        // Release only our own fence; a newer owner's lease is never modified.
        await (await collection(table)).updateOne({ _id: projectionId(table, id, source), "_sync.owner": claim.owner, "_sync.generation": claim.generation }, { $unset: { "_sync.owner": "", "_sync.lease_until": "" } }, { writeConcern: concern }).catch(() => {});
        throw error;
      }
    },
    async refreshEvent(event, db) { const results = []; for (const [table, id] of await repository.targets(db, event)) results.push(await this.refresh(table, id, db, String(event.event_id))); return results; },
  };
}
let defaultProjector;
export const getProjector = () => defaultProjector ||= createProjector();
export async function projectionStatus() {
  const db = await getMongoDatabase(), pool = getMysqlPool(), source = syncSource(), collections = [];
  for (const [table, mapping] of Object.entries(PROJECTIONS)) {
    const [[row]] = await pool.query(`SELECT COUNT(*) total FROM \`${table}\``);
    const col = db.collection(mapping.collection);
    const active = await col.countDocuments({ source, "_sync.state": "ready", "_sync.deleted": false }, { maxTimeMS: 10000 });
    const tombstones = await col.countDocuments({ source, "_sync.state": "deleted" }, { maxTimeMS: 10000 });
    const latest = await col.find({ source, "_sync.updated_at": { $exists: true } }, { projection: { _id: 0, "_sync.updated_at": 1 }, maxTimeMS: 10000 }).sort({ "_sync.updated_at": -1 }).limit(1).toArray();
    collections.push({ table, name: mapping.collection, source_count: Number(row.total), active, tombstones, last_success_at: latest[0]?._sync.updated_at || null });
  }
  const jobs = await db.collection(PROJECTION_CONTROL).find({ source }, { projection: { _id: 0, mode: 1, state: 1, updated_at: 1, completed_at: 1, progress: 1, error: 1 }, maxTimeMS: 10000 }).toArray();
  return { collections, jobs };
}
