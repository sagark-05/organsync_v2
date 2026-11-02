import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
import { createRequire } from "node:module";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../src/lib/db/mongodb.js";
import { projectionId } from "../src/lib/sync/projection-schema.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
try {
  const fixture = JSON.parse(await fs.readFile(".artifacts/projection-browser-record.json", "utf8")), centre = process.argv.includes("--updated") ? fixture.updated_centre_id : fixture.initial_centre_id;
  const db = await getMongoDatabase(); let actual;
  for (let attempt = 0; attempt < 100; attempt++) {
    actual = await db.collection("donors").findOne({ _id: projectionId("donor", fixture.donor_id) });
    if (actual?._sync.state === "ready" && actual.data?.centre_id === centre) break;
    await setTimeout(200);
  }
  assert.deepEqual(actual?.data, { donor_id: fixture.donor_id, centre_id: centre });
  assert.ok(actual._sync.last_event_id, "Run before a later reconciliation replaces event correlation.");
  const [events] = await getMysqlPool().execute("SELECT status,aggregate_type,CAST(aggregate_id AS CHAR) aggregate_id FROM sync_outbox WHERE event_id=?", [actual._sync.last_event_id]);
  assert.equal(events[0]?.status, "DELIVERED"); assert.equal(events[0]?.aggregate_type, "donor"); assert.equal(events[0]?.aggregate_id, fixture.donor_id);
  const [rows] = await getMysqlPool().execute("SELECT CAST(centre_id AS CHAR) centre_id FROM donor WHERE donor_id=?", [fixture.donor_id]); assert.equal(rows[0]?.centre_id, centre);
  assert.equal(await db.collection("donors").countDocuments({ _id: actual._id }), 1);
  const result = { scenario: process.argv.includes("--updated") ? "website_update" : "website_create", verifiedAt: new Date().toISOString(), document_id: actual._id, data: actual.data, state: actual._sync.state, event_id: actual._sync.last_event_id, automaticWorkerDelivery: true };
  await fs.writeFile(`.artifacts/projection-browser-${process.argv.includes("--updated") ? "update" : "create"}-evidence.json`, JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} catch { console.error("Browser projection verification failed; private data and raw errors withheld."); process.exitCode = 1; }
finally { await closeMongoConnection(); await getMysqlPool().end(); }
