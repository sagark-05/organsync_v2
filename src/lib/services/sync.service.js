import { randomBytes } from "node:crypto";
import { getMysqlPool } from "../db/mysql.js";
import { getMongoDatabase } from "../db/mongodb.js";
import { syncRepository } from "../repositories/sync.repository.js";
import { recordMutation } from "../sync/outbox.js";
import { createSyncWorker } from "../sync/worker.js";
import { SYNC_COLLECTIONS, syncSource, safeSyncError } from "../sync/documents.js";
import { recentSyncErrors } from "../sync/errors.js";
import { projectionEnabled } from "../sync/projection-schema.js";
import { projectionStatus } from "../sync/projections.js";

export async function synchronizationStatus() {
  const mysql = await syncRepository.status();
  let atlas;
  try {
    const db = await getMongoDatabase(); await db.command({ ping: 1 });
    const collections = [];
    for (const name of SYNC_COLLECTIONS) collections.push({ name, count: await db.collection(name).countDocuments({}, { maxTimeMS: 10000 }) });
    const recent = await db.collection("sync_events").find({ source: syncSource(), schema_version: 1 }, { projection: { _id: 0, event_id: 1, aggregate_type: 1, event_type: 1, occurred_at: 1 }, maxTimeMS: 10000 }).sort({ occurred_at: -1 }).limit(20).toArray();
    const recentAudits = await db.collection("audit_history").find({ source: syncSource(), schema_version: 1 }, { projection: { _id: 0, audit_id: 1, entity_name: 1, entity_id: 1, action: 1, occurred_at: 1 }, maxTimeMS: 10000 }).sort({ occurred_at: -1 }).limit(20).toArray();
    atlas = { connected: true, collections, recent, recentAudits, business: projectionEnabled() ? { enabled: true, ...await projectionStatus() } : { enabled: false, collections: [], jobs: [] } };
  } catch (error) { atlas = { connected: false, code: safeSyncError(error), collections: [], recent: [], recentAudits: [] }; }
  return { mysql, atlas, errors: await recentSyncErrors() };
}

// A committed metadata marker exercises the real outbox without clinical writes.
export async function createSyncDemonstration() {
  const db = await getMysqlPool().getConnection();
  let eventId;
  try {
    await db.beginTransaction();
    const id = String(randomBytes(6).readUIntBE(0, 6));
    await recordMutation(db, "sync_demo", id, "CREATED");
    eventId = String((await db.query("SELECT LAST_INSERT_ID() AS id"))[0][0].id);
    await db.commit();
  } catch (error) { await db.rollback(); throw error; }
  finally { db.release(); }
  return createSyncWorker().runOnce({ eventId });
}
