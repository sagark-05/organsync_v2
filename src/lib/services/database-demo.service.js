import { createHash } from "node:crypto";
import { getMysqlPool } from "../db/mysql.js";
import { AppError } from "../validation/records.js";
import { DEMO_SCENARIOS } from "../database-demo/catalog.js";
import { demoFixtures, demoStatement, demoState, prepareDemo } from "../repositories/demo.repository.js";
import { requireTransactionSafeDefinition } from "../repositories/allocation.repository.js";

export async function databaseDemoCatalog(pool = getMysqlPool()) {
  const [triggers] = await pool.query("SELECT TRIGGER_NAME AS name, ACTION_TIMING AS timing, EVENT_MANIPULATION AS event, EVENT_OBJECT_TABLE AS table_name FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const [procedures] = await pool.query("SELECT ROUTINE_NAME AS name FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_TYPE='PROCEDURE' ORDER BY ROUTINE_NAME");
  const [constraints] = await pool.query("SELECT CONSTRAINT_NAME AS name, TABLE_NAME AS table_name FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE()");
  return { scenarios: DEMO_SCENARIOS.map(row => ({ ...row, installed: row.enforcement === "constraint" ? constraints.some(item => item.name === row.object && item.table_name === row.table) : row.enforcement === "procedure" ? procedures.some(item => item.name === row.object) : triggers.some(trigger => trigger.name === row.object && trigger.timing === row.timing && trigger.event === row.event && trigger.table_name === row.table) })), triggers, constraints, procedures };
}
export async function runDatabaseDemo(scenarioId, pool = getMysqlPool()) {
  const scenario = DEMO_SCENARIOS.find(row => row.id === scenarioId);
  if (!scenario) throw new AppError(400, "UNKNOWN_SCENARIO", "Select one of the fixed database scenarios.");
  const db = await pool.getConnection(); let f, result, primaryError;
  try {
    const [[version]] = await db.query("SELECT VERSION() AS version");
    const [engines] = await db.query("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('transplant_centre','organ_type','app_user','donor','patient','organ','waiting_list','organ_match','compatibility_test','organ_allocation','active_organ_reservation','transplant','organ_transplant_record','transplant_follow_up','audit_log','sync_outbox')");
    if (engines.length !== 16 || engines.some(row => row.ENGINE !== "InnoDB")) throw new AppError(409, "TRANSACTIONAL_TABLES_REQUIRED", "All demonstration tables must use InnoDB. No fixtures were created.");
    let objectDefinition = null;
    if (scenario.enforcement === "trigger") {
      const [rows] = await db.execute("SELECT ACTION_STATEMENT, ACTION_TIMING, EVENT_MANIPULATION, EVENT_OBJECT_TABLE FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND TRIGGER_NAME=?", [scenario.object]);
      objectDefinition = rows[0];
      if (!objectDefinition || objectDefinition.ACTION_TIMING !== scenario.timing || objectDefinition.EVENT_MANIPULATION !== scenario.event || objectDefinition.EVENT_OBJECT_TABLE !== scenario.table || (scenario.message && !objectDefinition.ACTION_STATEMENT.includes(scenario.message))) throw new AppError(409, "TRIGGER_DEFINITION_MISMATCH", "The selected live trigger is absent or does not match the fixed demonstration. No attempt was run.");
    }
    if (scenario.enforcement === "procedure") {
      const [rows] = await db.execute("SELECT ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_TYPE='PROCEDURE' AND ROUTINE_NAME=?", [scenario.object]);
      if (!rows.length) throw new AppError(409, "PROCEDURE_NOT_INSTALLED", "This optional procedure is not installed. No demonstration was run.");
      requireTransactionSafeDefinition(rows[0].ROUTINE_DEFINITION);
      objectDefinition = { ACTION_STATEMENT: rows[0].ROUTINE_DEFINITION };
    }
    await db.beginTransaction();
    f = await demoFixtures(db); await prepareDemo(db, f, scenario);
    const before = await demoState(db, f);
    let actual = "accepted", affectedRows = null, mysql = { code: null, errno: null, sqlState: "00000", message: "MySQL accepted the fixed SQL operation." }, verifiedObject = scenario.object;
    const [sql, values] = demoStatement(f, scenario.id);
    if (scenario.enforcement === "procedure") await db.query("SAVEPOINT organsync_phase3e_call");
    try { const [operation] = await db.execute(sql, values); affectedRows = operation.affectedRows; }
    catch (error) {
      actual = "rejected";
      const triggerVerified = ["trigger", "procedure"].includes(scenario.enforcement) && error.errno === 1644 && error.sqlState === "45000" && error.sqlMessage === scenario.message && objectDefinition.ACTION_STATEMENT.includes(scenario.message);
      const constraintVerified = scenario.id === "priority-constraint-reject" ? error.code === "ER_CHECK_CONSTRAINT_VIOLATED" && error.sqlMessage?.includes("chk_waiting_priority") : scenario.id === "duplicate-registration-reject" && error.code === "ER_DUP_ENTRY" && error.sqlMessage?.includes("uq_active_waiting_registration");
      verifiedObject = triggerVerified || constraintVerified ? scenario.object : null;
      mysql = { code: /^[A-Z0-9_]+$/.test(error.code || "") ? error.code : "DATABASE_ERROR", errno: Number.isInteger(error.errno) ? error.errno : null, sqlState: /^[A-Z0-9]{5}$/.test(error.sqlState || "") ? error.sqlState : null, message: triggerVerified || constraintVerified ? scenario.message : "MySQL rejected the operation for a different reason; the selected object was not verified." };
    }
    const after = await demoState(db, f);
    const statePreserved = JSON.stringify(before) === JSON.stringify(after);
    const definitionSha256 = objectDefinition ? createHash("sha256").update(objectDefinition.ACTION_STATEMENT).digest("hex") : null;
    result = { scenario, statement: { sql, fixtureParameters: values }, actual, affectedRows: Number.isInteger(affectedRows) ? affectedRows : null, actualObject: verifiedObject, enforcement: verifiedObject ? scenario.enforcement : "unverified_database_error", reachedDatabase: true, validationIntercepted: false, mysql, before, after, statePreserved, passed: actual === scenario.expected && verifiedObject === scenario.object && (actual === "rejected" ? statePreserved : !statePreserved && (scenario.enforcement === "procedure" || affectedRows > 0)), databaseVersion: version.version, objectDefinitionSha256: definitionSha256, triggerDefinitionSha256: scenario.enforcement === "trigger" ? definitionSha256 : null, executedAt: new Date().toISOString() };
  } catch (error) { primaryError = error; }
  finally {
    try {
      await db.rollback();
      if (f) {
        const [[row]] = await db.execute("SELECT (SELECT COUNT(*) FROM transplant_centre WHERE centre_id=?) AS centres, (SELECT COUNT(*) FROM app_user WHERE user_id=?) AS users, (SELECT COUNT(*) FROM organ_type WHERE organ_type_id IN (?, ?)) AS types", [f.centre, f.user, f.type, f.otherType]);
        const verified = Object.values(row).every(value => Number(value) === 0);
        if (!verified) throw new Error("Fixture rollback verification failed.");
        if (result) result.rollback = { completed: true, fixtureAbsenceVerified: true, message: "All fixture changes rolled back. No original record IDs were used. AUTO_INCREMENT gaps may remain." };
      }
    } catch (error) { primaryError = error; }
    finally { db.release(); }
  }
  if (primaryError) throw primaryError;
  return result;
}
