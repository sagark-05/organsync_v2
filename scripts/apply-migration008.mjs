import fs from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { getMysqlPool } from "../src/lib/db/mysql.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

const hash = value => createHash("sha256").update(value).digest("hex");
const names = ["trg_allocation_evidence_guard", "trg_allocation_transition_guard", "trg_follow_up_immutable_update", "trg_follow_up_immutable_delete"];
const targets = [["organ_allocation", "INSERT"], ["organ_allocation", "UPDATE"], ["transplant_follow_up", "UPDATE"], ["transplant_follow_up", "DELETE"]];
const normalize = value => value.replace(/\s+/g, " ").trim();
const check = (condition, message) => { if (!condition) throw new Error(message); };
const sourcePath = "database/migrations/008_phase3e_reconciliation_proposal.sql";
const source = fs.readFileSync(sourcePath, "utf8");
const statements = []; let delimiter = ";", buffer = "";
for (const line of source.replaceAll("\r\n", "\n").split("\n")) {
  if (line.trim().startsWith("--") || !line.trim()) continue;
  if (/^DELIMITER /i.test(line.trim())) { check(!buffer.trim(), "Unterminated SQL before DELIMITER."); delimiter = line.trim().slice(10).trim(); continue; }
  buffer += line + "\n";
  if (line.trimEnd().endsWith(delimiter)) { statements.push(buffer.trimEnd().slice(0, -delimiter.length).trim()); buffer = ""; }
}
check(!buffer.trim(), "Unterminated SQL at end of migration.");
check(statements.length === 6 && statements[0] === "USE organsync_v2", "Unexpected migration statement count/database.");
const creates = statements.slice(1, 5), ledgerStatement = statements[5];
creates.forEach((sql, index) => {
  const match = sql.match(/^CREATE TRIGGER (\w+)\s+BEFORE (INSERT|UPDATE|DELETE) ON (\w+) FOR EACH ROW\s+(BEGIN[\s\S]*END)$/);
  check(match && match[1] === names[index] && match[2] === targets[index][1] && match[3] === targets[index][0], "Unexpected CREATE TRIGGER definition.");
  check(!/\b(?:DROP|ALTER|TRUNCATE|COMMIT|ROLLBACK|START TRANSACTION)\b/i.test(sql), "Unexpected SQL operation.");
});
check(normalize(ledgerStatement) === "INSERT INTO schema_migration (version,description) VALUES ('008','Reconcile missing Phase3E allocation and follow-up integrity triggers')", "Unexpected ledger statement.");

async function inventory(db) {
  const [[server]] = await db.query("SELECT DATABASE() AS db, VERSION() AS version");
  const [ledger] = await db.query("SELECT version,description,applied_at FROM schema_migration ORDER BY version");
  const [triggers] = await db.query("SELECT TRIGGER_NAME,ACTION_TIMING,EVENT_MANIPULATION,EVENT_OBJECT_TABLE,ACTION_STATEMENT FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const [routines] = await db.query("SELECT ROUTINE_NAME,ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_TYPE='PROCEDURE' ORDER BY ROUTINE_NAME");
  return { server, ledger, triggers, routines };
}
async function fingerprints(db) {
  const [tables] = await db.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const result = {};
  for (const { TABLE_NAME: table } of tables) {
    check(/^\w+$/.test(table), "Unsupported table identifier.");
    const [columns] = await db.execute("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION", [table]);
    const [primary] = await db.execute("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION", [table]);
    check(primary.length > 0 && [...columns, ...primary].every(row => /^\w+$/.test(row.COLUMN_NAME)), "Unsupported column/key identifier.");
    const [rows] = await db.query(`SELECT ${columns.map(row => "`" + row.COLUMN_NAME + "`").join(",")} FROM \`${table}\` ORDER BY ${primary.map(row => "`" + row.COLUMN_NAME + "`").join(",")}`);
    const originalRows = table === "schema_migration" ? rows.filter(row => row.version !== "008") : rows;
    result[table] = { count: originalRows.length, sha256: hash(JSON.stringify(originalRows)) };
  }
  return result;
}
const pool = getMysqlPool(), db = await pool.getConnection();
const record = { migration: "008", sourceSha256: hash(source), startedAt: new Date().toISOString(), appliedStatements: [], status: "preflight" };
fs.mkdirSync(".artifacts", { recursive: true });
const save = () => fs.writeFileSync(".artifacts/migration008-application.json", JSON.stringify(record, null, 2));
try {
  const [[lock]] = await db.query("SELECT GET_LOCK('organsync_v2:migration008',0) AS acquired"); check(Number(lock.acquired) === 1, "Migration lock is held; stop.");
  const before = await inventory(db); record.before = before;
  check(before.server.db === "organsync_v2" && /^8\./.test(before.server.version), "Unexpected database/server.");
  check(before.ledger.some(row => row.version === "007") && !before.ledger.some(row => row.version === "008"), "Expected 007 recorded and 008 absent; stop.");
  check(!before.triggers.some(row => names.includes(row.TRIGGER_NAME)), "A proposed trigger already exists; stop.");
  const earlier = JSON.parse(fs.readFileSync(".artifacts/migration008-readonly-preflight.json", "utf8"));
  check(JSON.stringify(before.ledger) === JSON.stringify(earlier.ledger), "Migration ledger changed after read-only preflight; stop.");
  check(JSON.stringify(before.triggers.map(row => [row.TRIGGER_NAME, hash(row.ACTION_STATEMENT)])) === JSON.stringify(earlier.triggers.map(row => [row.TRIGGER_NAME, row.definitionSha256])), "Live triggers changed after preflight; stop.");
  check(JSON.stringify(before.routines.map(row => [row.ROUTINE_NAME, hash(row.ROUTINE_DEFINITION || "")])) === JSON.stringify(earlier.routines.map(row => [row.name, row.definitionSha256])), "Live procedures changed after preflight; stop.");
  const [columns] = await db.query("SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('organ_allocation','compatibility_test','app_user','transplant_follow_up','schema_migration') ORDER BY TABLE_NAME,ORDINAL_POSITION");
  check(JSON.stringify(columns) === JSON.stringify(earlier.columns), "Referenced schema changed after preflight; stop.");
  check(columns.some(row => row.TABLE_NAME === "organ_allocation" && row.COLUMN_NAME === "allocation_status" && row.COLUMN_TYPE === "enum('RESERVED','RELEASED','COMPLETED')"), "Allocation enum mismatch.");
  record.beforeRows = await fingerprints(db); save();
  if (!process.argv.includes("--apply")) { record.status = "validated_preflight_only"; save(); console.log("Migration 008 validated; no SQL changes applied. Use --apply only with user approval."); }
  else {
    for (let index = 0; index < creates.length; index++) {
      const current = await inventory(db);
      check(!current.ledger.some(row => row.version === "008") && current.triggers.length === before.triggers.length + index, "Database state drifted during application; stop.");
      check(JSON.stringify(current.routines) === JSON.stringify(before.routines), "Procedure definitions changed; stop.");
      for (const original of before.triggers) check(current.triggers.some(row => JSON.stringify(row) === JSON.stringify(original)), "An existing trigger changed; stop.");
      check(!current.triggers.some(row => names.slice(index).includes(row.TRIGGER_NAME)), "Unapplied target trigger unexpectedly exists; stop.");
      await db.query(creates[index]); // MySQL syntax compilation; any error stops before the next statement.
      record.appliedStatements.push(names[index]); save();
    }
    const created = await inventory(db);
    creates.forEach((sql, index) => { const actual = created.triggers.find(row => row.TRIGGER_NAME === names[index]); check(actual && actual.ACTION_TIMING === "BEFORE" && actual.EVENT_MANIPULATION === targets[index][1] && actual.EVENT_OBJECT_TABLE === targets[index][0] && normalize(actual.ACTION_STATEMENT) === normalize(sql.slice(sql.indexOf("BEGIN"))), "Created trigger definition verification failed."); });
    check(JSON.stringify(await fingerprints(db)) === JSON.stringify(record.beforeRows), "Existing records changed before ledger insertion; stop.");
    await db.query(ledgerStatement);
    record.appliedStatements.push("schema_migration:008"); record.after = await inventory(db); record.afterRows = await fingerprints(db);
    check(record.after.ledger.filter(row => row.version === "008").length === 1, "Migration ledger verification failed.");
    check(JSON.stringify(record.afterRows) === JSON.stringify(record.beforeRows), "Existing row fingerprints differ after migration.");
    record.status = "applied_and_verified"; record.finishedAt = new Date().toISOString(); save();
    console.log(JSON.stringify({ status: record.status, triggers: names, triggerCount: record.after.triggers.length, originalTablesVerified: Object.keys(record.beforeRows).length, ledger008: true }));
  }
} catch (error) { record.status = "stopped_on_error"; record.error = { code: error.code || null, message: error.code ? "MySQL error; execution stopped immediately. Inspect live metadata before any retry." : error.message }; save(); console.error(JSON.stringify(record.error)); process.exitCode = 1; }
finally { try { await db.query("SELECT RELEASE_LOCK('organsync_v2:migration008')"); } finally { db.release(); await pool.end(); } }
