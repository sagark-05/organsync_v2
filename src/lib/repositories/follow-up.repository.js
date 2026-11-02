import { getMysqlPool } from "../db/mysql.js";
import { filtersFor, lastId, pagedQuery } from "./workflow.repository.js";
const columns = "f.follow_up_id, f.transplant_id, f.recorded_by, DATE_FORMAT(f.follow_up_date, '%Y-%m-%d') AS follow_up_date, f.patient_status, f.notes, u.full_name AS recorded_by_name";
const from = "transplant_follow_up f JOIN app_user u ON u.user_id = f.recorded_by";
export const followUpRepository = {
  list(options, db = getMysqlPool()) { return pagedQuery({ columns, from, ...filtersFor(options, { transplant_id: "f.transplant_id" }), options, order: "f.follow_up_date DESC, f.follow_up_id DESC" }, db); },
  async get(value, db = getMysqlPool()) { return (await db.execute(`SELECT ${columns} FROM ${from} WHERE f.follow_up_id = ?`, [value]))[0][0] || null; },
  async create(data, actorId, db) { await db.execute("INSERT INTO transplant_follow_up (transplant_id, recorded_by, follow_up_date, patient_status, notes) VALUES (?, ?, ?, ?, ?)", [data.transplant_id, actorId, data.follow_up_date, data.patient_status, data.notes]); return lastId(db); },
};
