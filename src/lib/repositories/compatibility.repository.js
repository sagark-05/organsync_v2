import { getMysqlPool } from "../db/mysql.js";
import { filtersFor, lastId, pagedQuery } from "./workflow.repository.js";
const columns = "ct.test_id, ct.match_id, ct.performed_by, ct.blood_group_result, ct.hla_result, ct.overall_result, ct.test_date, ct.remarks, u.full_name AS performed_by_name";
const from = "compatibility_test ct JOIN app_user u ON u.user_id = ct.performed_by";
export const compatibilityRepository = {
  list(options, db = getMysqlPool()) { return pagedQuery({ columns, from, ...filtersFor(options, { match_id: "ct.match_id" }), order: "ct.test_date DESC, ct.test_id DESC", options }, db); },
  async get(value, db = getMysqlPool()) { return (await db.execute(`SELECT ${columns} FROM ${from} WHERE ct.test_id = ?`, [value]))[0][0] || null; },
  async latest(matchId, db) { return (await db.execute("SELECT test_id, blood_group_result, hla_result, overall_result, test_date FROM compatibility_test WHERE match_id = ? ORDER BY test_date DESC, test_id DESC LIMIT 1 FOR UPDATE", [matchId]))[0][0] || null; },
  async clinicians(db = getMysqlPool()) { return (await db.query("SELECT user_id, full_name FROM app_user WHERE is_active = TRUE AND role = 'CLINICIAN' ORDER BY user_id"))[0]; },
  async clinician(value, db) { return (await db.execute("SELECT user_id FROM app_user WHERE user_id = ? AND is_active = TRUE AND role = 'CLINICIAN' FOR SHARE", [value]))[0][0]; },
  async create(data, db) {
    await db.execute("INSERT INTO compatibility_test (match_id, performed_by, blood_group_result, hla_result, overall_result, test_date, remarks) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?)", [data.match_id, data.performed_by, data.blood_group_result, data.hla_result, data.overall_result, data.remarks]);
    return lastId(db);
  },
};
