import { getMysqlPool } from "../db/mysql.js";
import { filtersFor, lastId, pagedQuery } from "./workflow.repository.js";

const columns = "w.waiting_id, w.patient_id, w.organ_type_id, w.centre_id, w.priority_level, w.status, w.registered_at, p.full_name AS patient_name, p.blood_group, t.organ_name, c.centre_name";
const from = "waiting_list w JOIN patient p ON p.patient_id = w.patient_id JOIN organ_type t ON t.organ_type_id = w.organ_type_id JOIN transplant_centre c ON c.centre_id = w.centre_id";
export const waitingListRepository = {
  list(options, db = getMysqlPool()) {
    return pagedQuery({ columns, from, ...filtersFor(options, { patient_id: "w.patient_id", organ_type_id: "w.organ_type_id", centre_id: "w.centre_id", priority_level: "w.priority_level", status: "w.status" }, ["p.full_name"]), order: "w.priority_level DESC, w.registered_at ASC, w.waiting_id ASC", options }, db);
  },
  async get(value, db = getMysqlPool()) { return (await db.execute(`SELECT ${columns} FROM ${from} WHERE w.waiting_id = ?`, [value]))[0][0] || null; },
  async create(data, db) {
    await db.execute("INSERT INTO waiting_list (patient_id, organ_type_id, centre_id, priority_level, status) VALUES (?, ?, ?, ?, 'ACTIVE')", [data.patient_id, data.organ_type_id, data.centre_id, data.priority_level]);
    return lastId(db);
  },
  async update(value, data, db) {
    const keys = ["patient_id", "organ_type_id", "centre_id", "priority_level", "status"].filter(key => Object.hasOwn(data, key));
    await db.execute(`UPDATE waiting_list SET ${keys.map(key => `${key} = ?`).join(", ")} WHERE waiting_id = ?`, [...keys.map(key => data[key]), value]);
  },
  async referenced(value, db) { return (await db.execute("SELECT match_id FROM organ_match WHERE waiting_id = ? LIMIT 1 FOR UPDATE", [value]))[0].length > 0; },
  async duplicate(patientId, typeId, exceptId, db) { return (await db.execute("SELECT waiting_id FROM waiting_list WHERE patient_id = ? AND organ_type_id = ? AND status IN ('ACTIVE','MATCHED') AND waiting_id <> ? LIMIT 1 FOR UPDATE", [patientId, typeId, exceptId]))[0].length > 0; },
  async delete(value, db) { await db.execute("DELETE FROM waiting_list WHERE waiting_id = ?", [value]); },
};
