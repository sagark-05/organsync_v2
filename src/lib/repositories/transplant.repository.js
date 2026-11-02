import { getMysqlPool } from "../db/mysql.js";
import { filtersFor, lastId, pagedQuery } from "./workflow.repository.js";
const from = "transplant tr JOIN organ_allocation a ON a.allocation_id = tr.allocation_id JOIN organ_match m ON m.match_id = a.match_id JOIN waiting_list w ON w.waiting_id = m.waiting_id JOIN patient p ON p.patient_id = w.patient_id JOIN organ o ON o.organ_id = m.organ_id JOIN organ_type ot ON ot.organ_type_id = o.organ_type_id JOIN transplant_centre c ON c.centre_id = tr.centre_id";
const columns = "tr.transplant_id, tr.allocation_id, tr.centre_id, tr.performed_at, tr.outcome, tr.notes, m.organ_id, p.full_name AS patient_name, ot.organ_name, c.centre_name";
export const transplantRepository = {
  list(options, db = getMysqlPool()) { return pagedQuery({ columns, from, ...filtersFor(options, { outcome: "tr.outcome" }), options, order: "tr.transplant_id DESC" }, db); },
  async get(value, db = getMysqlPool()) { return (await db.execute(`SELECT ${columns} FROM ${from} WHERE tr.transplant_id = ?`, [value]))[0][0] || null; },
  async exists(allocationId, organId, db) { return (await db.execute("SELECT transplant_id FROM transplant WHERE allocation_id = ? UNION ALL SELECT transplant_id FROM organ_transplant_record WHERE organ_id = ?", [allocationId, organId]))[0].length > 0; },
  async create(data, db) { await db.execute("INSERT INTO transplant (allocation_id, centre_id, performed_at, outcome, notes) VALUES (?, ?, ?, ?, ?)", [data.allocation_id, data.centre_id, data.performed_at, data.outcome, data.notes]); return lastId(db); },
  async complete(organId, waitingId, allocationId, transplantId, db) {
    await db.execute("INSERT INTO organ_transplant_record (organ_id, transplant_id) VALUES (?, ?)", [organId, transplantId]);
    await db.execute("UPDATE organ_allocation SET allocation_status = 'COMPLETED' WHERE allocation_id = ?", [allocationId]);
    await db.execute("UPDATE organ SET organ_status = 'TRANSPLANTED' WHERE organ_id = ?", [organId]);
    await db.execute("UPDATE waiting_list SET status = 'COMPLETED' WHERE waiting_id = ?", [waitingId]);
    await db.execute("DELETE FROM active_organ_reservation WHERE organ_id = ? AND allocation_id = ?", [organId, allocationId]);
  },
};
