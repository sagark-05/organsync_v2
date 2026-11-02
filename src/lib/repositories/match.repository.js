import { getMysqlPool } from "../db/mysql.js";
import { filtersFor, lastId, pagedQuery } from "./workflow.repository.js";

const joins = "JOIN waiting_list w ON w.waiting_id = m.waiting_id JOIN patient p ON p.patient_id = w.patient_id JOIN organ o ON o.organ_id = m.organ_id JOIN donor d ON d.donor_id = o.donor_id JOIN organ_type t ON t.organ_type_id = o.organ_type_id JOIN transplant_centre c ON c.centre_id = w.centre_id JOIN transplant_centre oc ON oc.centre_id = o.centre_id";
const latest = "LEFT JOIN compatibility_test ct ON ct.test_id = (SELECT ct2.test_id FROM compatibility_test ct2 WHERE ct2.match_id = m.match_id ORDER BY ct2.test_date DESC, ct2.test_id DESC LIMIT 1)";
const columns = "m.match_id, m.waiting_id, m.organ_id, m.match_status, m.created_at, w.patient_id, w.centre_id, w.priority_level, w.status AS waiting_status, p.full_name AS patient_name, p.blood_group AS patient_blood_group, d.full_name AS donor_name, d.blood_group AS donor_blood_group, t.organ_type_id, t.organ_name, c.centre_name, oc.centre_name AS organ_centre_name, o.organ_status, ct.test_id AS latest_test_id, ct.overall_result AS latest_overall_result, ct.blood_group_result AS latest_blood_group_result, ct.hla_result AS latest_hla_result, ct.test_date AS latest_test_date";
const from = `organ_match m ${joins} ${latest}`;
const noConflict = [
  "NOT EXISTS (SELECT 1 FROM organ_match pair WHERE pair.organ_id = o.organ_id AND pair.waiting_id = w.waiting_id)",
  "NOT EXISTS (SELECT 1 FROM organ_match approved WHERE approved.match_status = 'APPROVED' AND (approved.organ_id = o.organ_id OR approved.waiting_id = w.waiting_id))",
  "NOT EXISTS (SELECT 1 FROM active_organ_reservation ar WHERE ar.organ_id = o.organ_id)",
  "NOT EXISTS (SELECT 1 FROM organ_transplant_record tr WHERE tr.organ_id = o.organ_id)",
];
export const matchRepository = {
  list(options, db = getMysqlPool()) {
    return pagedQuery({ columns, from, ...filtersFor(options, { organ_id: "m.organ_id", waiting_id: "m.waiting_id", patient_id: "w.patient_id", centre_id: "w.centre_id", organ_type_id: "w.organ_type_id", match_status: "m.match_status" }, ["p.full_name", "d.full_name", "t.organ_name"]), order: "m.match_id DESC", options }, db);
  },
  async get(value, db = getMysqlPool()) { return (await db.execute(`SELECT ${columns} FROM ${from} WHERE m.match_id = ?`, [value]))[0][0] || null; },
  async lock(value, db) { return (await db.execute("SELECT match_id, waiting_id, organ_id, match_status FROM organ_match WHERE match_id = ? FOR UPDATE", [value]))[0][0]; },
  async create(data, db) { await db.execute("INSERT INTO organ_match (waiting_id, organ_id, match_status) VALUES (?, ?, 'PROPOSED')", [data.waiting_id, data.organ_id]); return lastId(db); },
  async update(value, status, db) { await db.execute("UPDATE organ_match SET match_status = ? WHERE match_id = ?", [status, value]); },
  async pairExists(waitingId, organId, db) { return (await db.execute("SELECT match_id FROM organ_match WHERE waiting_id = ? AND organ_id = ? LIMIT 1 FOR UPDATE", [waitingId, organId]))[0].length > 0; },
  async competingApproval(waitingId, organId, exceptId, db) { return (await db.execute("SELECT match_id FROM organ_match WHERE match_status = 'APPROVED' AND (waiting_id = ? OR organ_id = ?) AND match_id <> ? LIMIT 1 FOR UPDATE", [waitingId, organId, exceptId]))[0].length > 0; },
  candidates(options, db = getMysqlPool()) {
    const query = filtersFor(options, { organ_id: "o.organ_id", waiting_id: "w.waiting_id", patient_id: "w.patient_id", centre_id: "w.centre_id", organ_type_id: "w.organ_type_id" }, ["p.full_name", "d.full_name", "t.organ_name"]);
    return pagedQuery({ columns: "w.waiting_id, w.patient_id, w.organ_type_id, w.centre_id, w.priority_level, p.full_name AS patient_name, p.blood_group AS patient_blood_group, o.organ_id, d.full_name AS donor_name, d.blood_group AS donor_blood_group, t.organ_name, c.centre_name, oc.centre_name AS organ_centre_name", from: "waiting_list w JOIN patient p ON p.patient_id = w.patient_id JOIN organ o ON o.organ_type_id = w.organ_type_id JOIN donor d ON d.donor_id = o.donor_id JOIN organ_type t ON t.organ_type_id = w.organ_type_id JOIN transplant_centre c ON c.centre_id = w.centre_id JOIN transplant_centre oc ON oc.centre_id = o.centre_id", where: ["w.status = 'ACTIVE'", "o.organ_status = 'AVAILABLE'", ...noConflict, ...query.where], values: query.values, order: "w.priority_level DESC, w.registered_at ASC, w.waiting_id ASC, o.organ_id ASC", options }, db);
  },
};
