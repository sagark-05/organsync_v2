import { createRequire } from "node:module";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../src/lib/db/mongodb.js";
import { synchronizationStatus } from "../src/lib/services/sync.service.js";
import { eventDocument } from "../src/lib/sync/documents.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
try {
  const status = await synchronizationStatus();
  if (!status.atlas.connected) throw new Error("Atlas verification failed.");
  const atlas = await getMongoDatabase(), [rows] = await getMysqlPool().query("SELECT * FROM sync_outbox WHERE aggregate_type='sync_demo' AND status='DELIVERED' ORDER BY event_id");
  for (const row of rows) {
    const expected = eventDocument(row), doc = await atlas.collection("sync_events").findOne({ _id: expected._id });
    if (!doc || doc.content_sha256 !== expected.content_sha256) throw new Error("Delivery evidence mismatch.");
  }
  console.log(JSON.stringify({ atlasPing: true, outbox: status.mysql.counts, collections: status.atlas.collections, verifiedDemoEventIds: rows.map(row => String(row.event_id)), retainedSanitizedErrors: status.errors.length }));
} catch { console.error("Live synchronization verification failed; no credentials or record contents printed."); process.exitCode = 1; }
finally { await closeMongoConnection(); await getMysqlPool().end(); }
