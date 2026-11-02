import { getMysqlPool } from "../db/mysql.js";
import { AppError, conflict } from "../validation/records.js";

export async function pagedQuery({ columns, from, where = [], values = [], order, options }, db = getMysqlPool()) {
  const predicate = where.length ? ` WHERE ${where.join(" AND ")}` : "";
  const [[count]] = await db.execute(`SELECT COUNT(*) AS total FROM ${from}${predicate}`, values);
  const [data] = await db.query(`SELECT ${columns} FROM ${from}${predicate} ORDER BY ${order} LIMIT ? OFFSET ?`, [...values, options.pageSize, (options.page - 1) * options.pageSize]);
  return { data, pagination: { page: options.page, pageSize: options.pageSize, total: Number(count.total), totalPages: Math.ceil(Number(count.total) / options.pageSize) } };
}
export function filtersFor(options, mapping, searchColumns = []) {
  const where = [], values = [];
  for (const [key, column] of Object.entries(mapping)) if (options[key]) { where.push(`${column} = ?`); values.push(options[key]); }
  if (options.search && searchColumns.length) { where.push(`(${searchColumns.map(column => `LOCATE(?, ${column}) > 0`).join(" OR ")})`); values.push(...searchColumns.map(() => options.search)); }
  return { where, values };
}
export async function lastId(db) { return (await db.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id"))[0][0].id; }
export async function lockOrgan(db, organId) {
  return (await db.execute("SELECT organ_id, organ_type_id, centre_id, organ_status FROM organ WHERE organ_id = ? FOR UPDATE", [organId]))[0][0];
}
export async function lockWaiting(db, waitingId) {
  return (await db.execute("SELECT waiting_id, patient_id, organ_type_id, centre_id, priority_level, status FROM waiting_list WHERE waiting_id = ? FOR UPDATE", [waitingId]))[0][0];
}
export async function requireReference(db, table, value) {
  const keys = { patient: "patient_id", organ_type: "organ_type_id", transplant_centre: "centre_id" };
  if (!keys[table]) throw new Error("Unsupported reference.");
  const [rows] = await db.execute(`SELECT ${keys[table]} FROM ${table} WHERE ${keys[table]} = ? FOR SHARE`, [value]);
  if (!rows.length) throw new AppError(400, "INVALID_REFERENCE", `${keys[table]} does not reference an existing record.`);
}
export async function requireNoAllocation(db, matchId) {
  const [rows] = await db.execute("SELECT allocation_id FROM organ_allocation WHERE match_id = ? AND allocation_status IN ('RESERVED','COMPLETED') LIMIT 1 FOR UPDATE", [matchId]);
  if (rows.length) conflict("A match with an active or completed allocation cannot be changed here.");
}
export async function requireUnreserved(db, organId) {
  const [rows] = await db.execute("SELECT organ_id FROM active_organ_reservation WHERE organ_id = ? UNION ALL SELECT organ_id FROM organ_transplant_record WHERE organ_id = ?", [organId, organId]);
  if (rows.length) conflict("This organ has a reservation or permanent transplant record.");
}
