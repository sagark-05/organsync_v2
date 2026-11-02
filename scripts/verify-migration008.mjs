import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { getMysqlPool } from "../src/lib/db/mysql.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const hash = value => createHash("sha256").update(value).digest("hex");
const applied = JSON.parse(fs.readFileSync(".artifacts/migration008-application.json", "utf8"));
assert.equal(applied.status, "applied_and_verified");
assert.equal(hash(fs.readFileSync("database/migrations/008_phase3e_reconciliation_proposal.sql", "utf8")), applied.sourceSha256, "Applied SQL file changed.");
const pool = getMysqlPool();
try {
  const [triggers] = await pool.query("SELECT TRIGGER_NAME,ACTION_TIMING,EVENT_MANIPULATION,EVENT_OBJECT_TABLE,ACTION_STATEMENT FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const [routines] = await pool.query("SELECT ROUTINE_NAME,ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_TYPE='PROCEDURE' ORDER BY ROUTINE_NAME");
  const [ledger] = await pool.query("SELECT version,description,applied_at FROM schema_migration ORDER BY version");
  assert.deepEqual(triggers, applied.after.triggers, "Triggers drifted after application.");
  assert.deepEqual(routines, applied.before.routines, "Existing procedures changed.");
  assert.deepEqual(ledger.filter(row => row.version !== "008"), applied.before.ledger, "Earlier migration ledger rows changed.");
  assert.equal(ledger.filter(row => row.version === "008").length, 1);
  assert.deepEqual(ledger, applied.after.ledger, "Migration ledger drifted after application.");
  const fingerprints = {};
  for (const table of Object.keys(applied.beforeRows)) {
    assert.match(table, /^\w+$/);
    const [columns] = await pool.execute("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION", [table]);
    const [primary] = await pool.execute("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION", [table]);
    assert.ok(primary.length > 0);
    assert.ok([...columns, ...primary].every(row => /^\w+$/.test(row.COLUMN_NAME)));
    const [data] = await pool.query(`SELECT ${columns.map(row => "`" + row.COLUMN_NAME + "`").join(",")} FROM \`${table}\` ORDER BY ${primary.map(row => "`" + row.COLUMN_NAME + "`").join(",")}`);
    const originalRows = table === "schema_migration" ? data.filter(row => row.version !== "008") : data;
    fingerprints[table] = { count: originalRows.length, sha256: hash(JSON.stringify(originalRows)) };
  }
  assert.deepEqual(fingerprints, applied.beforeRows, "Existing row data changed or fixtures remain.");
  const result = { verifiedAt: new Date().toISOString(), triggerCount: triggers.length, procedureCount: routines.length, earlierLedgerRowsUnchanged: true, existingRowsUnchanged: true, tablesFingerprinted: Object.keys(fingerprints).length, fingerprints };
  fs.writeFileSync(".artifacts/migration008-final-verification.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ triggerCount: triggers.length, procedureCount: routines.length, existingRowsUnchanged: true, tablesFingerprinted: Object.keys(fingerprints).length }));
} finally { await pool.end(); }
