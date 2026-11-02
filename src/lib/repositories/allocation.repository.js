import { getMysqlPool } from "../db/mysql.js";
import { filtersFor, lastId, pagedQuery } from "./workflow.repository.js";
import { AppError } from "../validation/records.js";
const from = "organ_allocation a JOIN organ_match m ON m.match_id = a.match_id JOIN waiting_list w ON w.waiting_id = m.waiting_id JOIN patient p ON p.patient_id = w.patient_id JOIN organ o ON o.organ_id = m.organ_id JOIN organ_type t ON t.organ_type_id = o.organ_type_id";
const columns = "a.allocation_id, a.match_id, a.allocation_status, a.allocated_at, a.released_at, m.organ_id, m.waiting_id, w.patient_id, p.full_name AS patient_name, t.organ_name";
export const allocationRepository = {
  list(options, db = getMysqlPool()) { return pagedQuery({ columns, from, ...filtersFor(options, { match_id: "a.match_id", allocation_status: "a.allocation_status" }), options, order: "a.allocation_id DESC" }, db); },
  async get(value, db = getMysqlPool()) { return (await db.execute(`SELECT ${columns} FROM ${from} WHERE a.allocation_id = ?`, [value]))[0][0] || null; },
  async lock(value, db) { return (await db.execute("SELECT allocation_id, match_id, allocation_status, allocated_at FROM organ_allocation WHERE allocation_id = ? FOR UPDATE", [value]))[0][0]; },
  async create(matchId, db) {
    await db.execute("INSERT INTO organ_allocation (match_id, allocation_status, allocated_at) VALUES (?, 'RESERVED', UTC_TIMESTAMP())", [matchId]);
    return lastId(db);
  },
  async reserve(organId, waitingId, allocationId, db) {
    await db.execute("INSERT INTO active_organ_reservation (organ_id, allocation_id) VALUES (?, ?)", [organId, allocationId]);
    await db.execute("UPDATE organ SET organ_status = 'RESERVED' WHERE organ_id = ?", [organId]);
    await db.execute("UPDATE waiting_list SET status = 'MATCHED' WHERE waiting_id = ?", [waitingId]);
  },
  async reservation(organId, allocationId, db) { return (await db.execute("SELECT organ_id FROM active_organ_reservation WHERE organ_id = ? AND allocation_id = ? FOR UPDATE", [organId, allocationId]))[0].length === 1; },
  async release(organId, waitingId, allocationId, db) {
    await db.execute("DELETE FROM active_organ_reservation WHERE organ_id = ? AND allocation_id = ?", [organId, allocationId]);
    await db.execute("UPDATE organ_allocation SET allocation_status = 'RELEASED', released_at = UTC_TIMESTAMP() WHERE allocation_id = ?", [allocationId]);
    await db.execute("UPDATE organ SET organ_status = 'AVAILABLE' WHERE organ_id = ?", [organId]);
    await db.execute("UPDATE waiting_list SET status = 'ACTIVE' WHERE waiting_id = ?", [waitingId]);
  },
};
export async function transactionProcedure(name, values, db) {
  const allowed = { allocate: "sp_allocate_organ_tx", release: "sp_release_allocation_tx", transplant: "sp_record_transplant_tx" };
  const procedure = allowed[name]; if (!procedure) throw new Error("Unknown workflow procedure.");
  const [found] = await db.execute("SELECT ROUTINE_NAME, ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_NAME = ?", [procedure]);
  if (!found.length) return null;
  requireTransactionSafeDefinition(found[0].ROUTINE_DEFINITION);
  // Proposed *_tx routines consume this hand-off savepoint before any write.
  // Calling them outside an explicit caller transaction fails at the guard.
  await db.query("SAVEPOINT organsync_phase3e_call");
  const [result] = await db.query(`CALL ${procedure}(${values.map(() => "?").join(", ")})`, values);
  return { used: true, result: result[0]?.[0] || {} };
}
export function requireTransactionSafeDefinition(definition) {
  const body = typeof definition === "string" ? definition.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "") : "";
  if (!body || /\b(?:COMMIT|ROLLBACK|CREATE|ALTER|DROP|TRUNCATE|PREPARE|EXECUTE|CALL)\b|\bSTART\s+TRANSACTION\b|\bSET\s+(?:SESSION\s+)?AUTOCOMMIT\b|\b(?:UN)?LOCK\s+TABLES\b/i.test(body) || !/RELEASE\s+SAVEPOINT\s+organsync_phase3e_call/i.test(body) || !/INSERT\s+INTO\s+audit_log/i.test(body) || !/INSERT\s+INTO\s+sync_outbox/i.test(body)) {
    throw new AppError(409, "PROCEDURE_REVIEW_REQUIRED", "The installed workflow procedure does not meet caller-owned transaction, audit, and outbox requirements. No procedure was called.");
  }
}
