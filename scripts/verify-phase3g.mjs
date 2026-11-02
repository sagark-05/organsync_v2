import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../src/lib/db/mongodb.js";
import { eventDocument } from "../src/lib/sync/documents.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const evidence = { executedAt: new Date().toISOString(), readOnly: true };
try {
  const db = getMysqlPool(), atlas = await getMongoDatabase(); await atlas.command({ ping: 1 });
  const [tables] = await db.query("SELECT TABLE_NAME name,ENGINE engine FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const [triggers] = await db.query("SELECT TRIGGER_NAME name,EVENT_OBJECT_TABLE table_name,ACTION_TIMING timing,EVENT_MANIPULATION event FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const [procedures] = await db.query("SELECT ROUTINE_NAME name FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_TYPE='PROCEDURE' ORDER BY ROUTINE_NAME");
  assert.equal(tables.length, 19); assert.equal(triggers.length, 20); assert.equal(procedures.length, 3); assert.ok(tables.every(table => table.engine === "InnoDB"));
  evidence.inventory = { tables, triggers, procedures };
  evidence.ledger = (await db.query("SELECT version,description FROM schema_migration ORDER BY version"))[0];
  assert.ok(evidence.ledger.some(row => row.version === "008"));
  evidence.indexes = (await db.query("SELECT TABLE_NAME,INDEX_NAME,NON_UNIQUE,COLUMN_NAME,EXPRESSION,SEQ_IN_INDEX FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX"))[0];
  evidence.queryExamples = [];
  for (const file of ["joins.sql", "ctes.sql", "aggregations.sql", "subqueries.sql"]) {
    const statements = (await fs.readFile(`database/queries/${file}`, "utf8")).replace(/--[^\n]*/g, "").split(";").map(sql => sql.trim()).filter(Boolean);
    for (const sql of statements) {
      if (/^USE\s+organsync_v2$/i.test(sql)) continue;
      assert.match(sql, /^(SELECT|WITH)\b/i);
      const [rows, columns] = await db.query(sql);
      evidence.queryExamples.push({ file, sql, resultRows: rows.length, columns: columns.map(column => column.name), passed: true });
    }
  }
  evidence.explain = (await db.query("EXPLAIN SELECT organ_id,organ_type_id,organ_status FROM organ WHERE organ_status='AVAILABLE' AND organ_type_id=1"))[0];
  const [journey] = await db.execute(`SELECT d.donor_id,p.patient_id,o.organ_id,w.waiting_id,m.match_id,a.allocation_id,t.transplant_id,f.follow_up_id,f.recorded_by,
    o.organ_status,w.status waiting_status,m.match_status,a.allocation_status,t.outcome,c.overall_result,c.blood_group_result,c.hla_result
    FROM donor d JOIN organ o ON o.donor_id=d.donor_id JOIN organ_match m ON m.organ_id=o.organ_id
    JOIN waiting_list w ON w.waiting_id=m.waiting_id JOIN patient p ON p.patient_id=w.patient_id
    JOIN organ_allocation a ON a.match_id=m.match_id JOIN transplant t ON t.allocation_id=a.allocation_id
    JOIN transplant_follow_up f ON f.transplant_id=t.transplant_id JOIN compatibility_test c ON c.match_id=m.match_id
    WHERE d.donor_id=? AND p.patient_id=? AND m.match_id=?`, ["382", "728", "391"]);
  assert.equal(journey.length, 1); const record = journey[0];
  for (const [key, value] of Object.entries({ organ_status: "TRANSPLANTED", waiting_status: "COMPLETED", match_status: "APPROVED", allocation_status: "COMPLETED", outcome: "SUCCESSFUL", overall_result: "COMPATIBLE", blood_group_result: "COMPATIBLE", hla_result: "COMPATIBLE" })) assert.equal(record[key], value);
  assert.equal(String(record.recorded_by), "358");
  assert.equal((await db.execute("SELECT * FROM active_organ_reservation WHERE organ_id=?", [record.organ_id]))[0].length, 0);
  assert.equal((await db.execute("SELECT * FROM organ_transplant_record WHERE organ_id=? AND transplant_id=?", [record.organ_id, record.transplant_id]))[0].length, 1);
  assert.equal((await db.execute("SELECT allocation_status FROM organ_allocation WHERE allocation_id=190"))[0][0].allocation_status, "RELEASED");
  evidence.fictionalBrowserJourney = record;
  const [outbox] = await db.query("SELECT * FROM sync_outbox ORDER BY event_id");
  const missing = [];
  for (const event of outbox) {
    assert.equal(event.status, "DELIVERED"); const expected = eventDocument(event);
    const actual = await atlas.collection("sync_events").findOne({ _id: expected._id });
    if (!actual || Object.entries(expected).some(([key, value]) => JSON.stringify(actual[key]) !== JSON.stringify(value))) missing.push(String(event.event_id));
  }
  assert.deepEqual(missing, []);
  evidence.synchronization = { atlasPing: true, deliveredEventsVerified: outbox.length, syncEvents: await atlas.collection("sync_events").countDocuments(), auditHistory: await atlas.collection("audit_history").countDocuments(), noPendingOrFailed: true };
  await fs.writeFile(".artifacts/phase3g-database-evidence.json", JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ inventory: { tables: tables.length, triggers: triggers.length, procedures: procedures.length }, queryExamplesPassed: evidence.queryExamples.length, fictionalBrowserJourney: record, synchronization: evidence.synchronization }));
} catch { console.error("Phase3G live verification failed; raw errors and credentials withheld."); process.exitCode = 1; }
finally { await closeMongoConnection(); await getMysqlPool().end(); }
