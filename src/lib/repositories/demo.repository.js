import { randomUUID } from "node:crypto";
import { lastId } from "./workflow.repository.js";
export async function demoFixtures(db) {
  const key = randomUUID().replaceAll("-", "").slice(0, 16);
  const insert = async (sql, values) => { await db.execute(sql, values); return lastId(db); };
  const centre = await insert("INSERT INTO transplant_centre (centre_name,city,state) VALUES (?, 'Fictional','Fictional')", [`Rollback viva centre ${key}`]);
  const type = await insert("INSERT INTO organ_type (organ_name) VALUES (?)", [`Viva A ${key}`]);
  const otherType = await insert("INSERT INTO organ_type (organ_name) VALUES (?)", [`Viva B ${key}`]);
  // Uncommitted, unloggable fixture identity, never a usable development account.
  const user = await insert("INSERT INTO app_user (full_name,email,password_hash,role) VALUES (?, ?, '!ROLLBACK_FIXTURE_NO_LOGIN', 'CLINICIAN')", [`Rollback clinician fixture ${key}`, `${key}@rollback.invalid`]);
  const donor = await insert("INSERT INTO donor (centre_id,full_name,date_of_birth,blood_group,donor_type) VALUES (?, 'Fictional rollback donor','1990-01-01','O+','DECEASED')", [centre]);
  const patient = await insert("INSERT INTO patient (centre_id,full_name,date_of_birth,sex,blood_group) VALUES (?, 'Fictional rollback patient','1995-01-01','UNDISCLOSED','O+')", [centre]);
  const patient2 = await insert("INSERT INTO patient (centre_id,full_name,date_of_birth,sex,blood_group) VALUES (?, 'Fictional rollback patient two','1996-01-01','UNDISCLOSED','O+')", [centre]);
  const organ = await insert("INSERT INTO organ (donor_id,organ_type_id,centre_id) VALUES (?, ?, ?)", [donor, type, centre]);
  const wrongOrgan = await insert("INSERT INTO organ (donor_id,organ_type_id,centre_id) VALUES (?, ?, ?)", [donor, otherType, centre]);
  const waiting = await insert("INSERT INTO waiting_list (patient_id,organ_type_id,centre_id,priority_level) VALUES (?, ?, ?, 3)", [patient, type, centre]);
  const waiting2 = await insert("INSERT INTO waiting_list (patient_id,organ_type_id,centre_id,priority_level) VALUES (?, ?, ?, 3)", [patient2, type, centre]);
  const match = await insert("INSERT INTO organ_match (waiting_id,organ_id) VALUES (?, ?)", [waiting, organ]);
  const approve = async value => {
    await db.execute("UPDATE organ_match SET match_status='TESTING' WHERE match_id=?", [value]);
    await db.execute("INSERT INTO compatibility_test (match_id,performed_by,blood_group_result,hla_result,overall_result) VALUES (?, ?, 'COMPATIBLE','COMPATIBLE','COMPATIBLE')", [value, user]);
    await db.execute("UPDATE organ_match SET match_status='APPROVED' WHERE match_id=?", [value]);
  };
  // Keep the main match PROPOSED unless a scenario needs approved fixture setup.
  return { centre, type, otherType, user, donor, patient, patient2, organ, wrongOrgan, waiting, waiting2, match, insert, approve };
}
export async function prepareDemo(db, f, scenario) {
  const name = scenario.id;
  if (name === "allocation-evidence-reject") {
    await f.approve(f.match);
    await db.execute("UPDATE app_user SET is_active=FALSE WHERE user_id=?", [f.user]);
  }
  if (name.startsWith("allocation-transition-")) {
    await f.approve(f.match);
    f.allocation = await f.insert("INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]);
    if (name.endsWith("reject")) await db.execute("UPDATE organ_allocation SET allocation_status='RELEASED' WHERE allocation_id=?", [f.allocation]);
  }
  if (name === "procedure-allocate-accept") await f.approve(f.match);
  if (name.startsWith("procedure-release-") || name.startsWith("procedure-transplant-")) {
    await f.approve(f.match);
    f.allocation = await f.insert("INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]);
    if (name.endsWith("accept")) {
      await db.execute("INSERT INTO active_organ_reservation (organ_id,allocation_id) VALUES (?, ?)", [f.organ, f.allocation]);
      await db.execute("UPDATE organ SET organ_status='RESERVED' WHERE organ_id=?", [f.organ]);
      await db.execute("UPDATE waiting_list SET status='MATCHED' WHERE waiting_id=?", [f.waiting]);
    }
  }
  if (name === "match-transition-reject") { await f.approve(f.match); await db.execute("UPDATE organ_match SET match_status='CANCELLED' WHERE match_id=?", [f.match]); }
  if (name === "compatibility-update-reject" || name === "compatibility-delete-reject") {
    await db.execute("UPDATE organ_match SET match_status='TESTING' WHERE match_id=?", [f.match]);
    f.test = await f.insert("INSERT INTO compatibility_test (match_id,performed_by,blood_group_result,hla_result,overall_result) VALUES (?, ?, 'UNKNOWN','UNKNOWN','INCONCLUSIVE')", [f.match, f.user]);
  }
  if (name.startsWith("approval-")) {
    await db.execute("UPDATE organ_match SET match_status='TESTING' WHERE match_id=?", [f.match]);
    if (name.endsWith("accept")) await db.execute("INSERT INTO compatibility_test (match_id,performed_by,blood_group_result,hla_result,overall_result) VALUES (?, ?, 'COMPATIBLE','COMPATIBLE','COMPATIBLE')", [f.match, f.user]);
  }
  if (["allocation-accept", "allocation-evidence-accept"].includes(name)) await f.approve(f.match);
  if (name.startsWith("reservation-") || name.startsWith("permanent-") || name.startsWith("transplant-") || name.startsWith("follow-up-")) {
    await f.approve(f.match);
    f.allocation = await f.insert("INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]);
  }
  if (name.startsWith("permanent-") || (name.startsWith("transplant-") && name !== "transplant-insert-reject") || name.startsWith("follow-up-")) {
    await db.execute("INSERT INTO active_organ_reservation (organ_id,allocation_id) VALUES (?, ?)", [f.organ, f.allocation]);
    await db.execute("UPDATE organ SET organ_status='RESERVED' WHERE organ_id=?", [f.organ]);
    await db.execute("UPDATE waiting_list SET status='MATCHED' WHERE waiting_id=?", [f.waiting]);
    f.transplant = await f.insert("INSERT INTO transplant (allocation_id,centre_id,performed_at,outcome) VALUES (?, ?, UTC_TIMESTAMP(), 'UNKNOWN')", [f.allocation, f.centre]);
  }
  if (name === "permanent-delete-reject") await db.execute("INSERT INTO organ_transplant_record (organ_id,transplant_id) VALUES (?, ?)", [f.organ, f.transplant]);
  if (name === "follow-up-update-reject" || name === "follow-up-delete-reject") f.followUp = await f.insert("INSERT INTO transplant_follow_up (transplant_id,recorded_by,follow_up_date,patient_status) VALUES (?, ?, UTC_DATE(),'Fictional stable')", [f.transplant, f.user]);
}
export function demoStatement(f, name) {
  const map = {
    "match-type-reject": ["INSERT INTO organ_match (waiting_id,organ_id) VALUES (?, ?)", [f.waiting2, f.wrongOrgan]],
    "match-type-accept": ["INSERT INTO organ_match (waiting_id,organ_id) VALUES (?, ?)", [f.waiting2, f.organ]],
    "approval-reject": ["UPDATE organ_match SET match_status='APPROVED' WHERE match_id=?", [f.match]],
    "approval-accept": ["UPDATE organ_match SET match_status='APPROVED' WHERE match_id=?", [f.match]],
    "allocation-reject": ["INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]],
    "allocation-accept": ["INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]],
    "reservation-reject": ["INSERT INTO active_organ_reservation (organ_id,allocation_id) VALUES (?, ?)", [f.wrongOrgan, f.allocation]],
    "reservation-accept": ["INSERT INTO active_organ_reservation (organ_id,allocation_id) VALUES (?, ?)", [f.organ, f.allocation]],
    "permanent-record-reject": ["INSERT INTO organ_transplant_record (organ_id,transplant_id) VALUES (?, ?)", [f.wrongOrgan, f.transplant]],
    "permanent-record-accept": ["INSERT INTO organ_transplant_record (organ_id,transplant_id) VALUES (?, ?)", [f.organ, f.transplant]],
    // An existing but different allocation ID is unnecessary: BEFORE UPDATE must SIGNAL before FK evaluation.
    "transplant-update-reject": ["UPDATE transplant SET allocation_id=0 WHERE transplant_id=?", [f.transplant]],
    "transplant-update-accept": ["UPDATE transplant SET notes='Fictional notes updated by viva scenario' WHERE transplant_id=?", [f.transplant]],
    "transplant-delete-reject": ["DELETE FROM transplant WHERE transplant_id=?", [f.transplant]],
    "permanent-delete-reject": ["DELETE FROM organ_transplant_record WHERE organ_id=?", [f.organ]],
    "organ-status-reject": ["UPDATE organ SET organ_status='TRANSPLANTED' WHERE organ_id=?", [f.organ]],
    "organ-status-accept": ["UPDATE organ SET organ_status='DISCARDED' WHERE organ_id=?", [f.organ]],
    "waiting-status-reject": ["UPDATE waiting_list SET status='COMPLETED' WHERE waiting_id=?", [f.waiting2]],
    "waiting-status-accept": ["UPDATE waiting_list SET status='CANCELLED' WHERE waiting_id=?", [f.waiting2]],
    "priority-constraint-reject": ["INSERT INTO waiting_list (patient_id,organ_type_id,centre_id,priority_level) VALUES (?, ?, ?, 6)", [f.patient, f.otherType, f.centre]],
    "duplicate-registration-reject": ["INSERT INTO waiting_list (patient_id,organ_type_id,centre_id,priority_level) VALUES (?, ?, ?, 3)", [f.patient, f.type, f.centre]],
    "match-transition-reject": ["UPDATE organ_match SET match_status='APPROVED' WHERE match_id=?", [f.match]],
    "compatibility-insert-reject": ["INSERT INTO compatibility_test (match_id,performed_by,blood_group_result,hla_result,overall_result) VALUES (?, ?, 'UNKNOWN','UNKNOWN','INCONCLUSIVE')", [f.match, f.user]],
    "compatibility-update-reject": ["UPDATE compatibility_test SET remarks='Attempted overwrite' WHERE test_id=?", [f.test]],
    "compatibility-delete-reject": ["DELETE FROM compatibility_test WHERE test_id=?", [f.test]],
    "transplant-insert-reject": ["INSERT INTO transplant (allocation_id,centre_id,performed_at,outcome) VALUES (?, ?, UTC_TIMESTAMP(), 'UNKNOWN')", [f.allocation, f.centre]],
    "follow-up-date-reject": ["INSERT INTO transplant_follow_up (transplant_id,recorded_by,follow_up_date,patient_status) VALUES (?, ?, '2000-01-01','Fictional')", [f.transplant, f.user]],
    "procedure-allocate-accept": ["CALL sp_allocate_organ_tx(?, ?)", [f.match, f.user]],
    "procedure-allocate-reject": ["CALL sp_allocate_organ_tx(?, ?)", [f.match, f.user]],
    "procedure-release-accept": ["CALL sp_release_allocation_tx(?, ?)", [f.allocation, f.user]],
    "procedure-release-reject": ["CALL sp_release_allocation_tx(?, ?)", [f.allocation, f.user]],
    "procedure-transplant-accept": ["CALL sp_record_transplant_tx(?, ?, ?, 'UNKNOWN', 'Fictional viva transplant', ?)", [f.allocation, f.centre, new Date().toISOString().slice(0, 19).replace("T", " "), f.user]],
    "procedure-transplant-reject": ["CALL sp_record_transplant_tx(?, ?, ?, 'UNKNOWN', 'Fictional viva transplant', ?)", [f.allocation, f.centre, new Date().toISOString().slice(0, 19).replace("T", " "), f.user]],
    "allocation-evidence-reject": ["INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]],
    "allocation-evidence-accept": ["INSERT INTO organ_allocation (match_id,allocated_at) VALUES (?, UTC_TIMESTAMP())", [f.match]],
    "allocation-transition-reject": ["UPDATE organ_allocation SET allocation_status='RESERVED' WHERE allocation_id=?", [f.allocation]],
    "allocation-transition-accept": ["UPDATE organ_allocation SET allocation_status='RELEASED' WHERE allocation_id=?", [f.allocation]],
    "follow-up-update-reject": ["UPDATE transplant_follow_up SET patient_status='Attempted overwrite' WHERE follow_up_id=?", [f.followUp]],
    "follow-up-delete-reject": ["DELETE FROM transplant_follow_up WHERE follow_up_id=?", [f.followUp]],
    "follow-up-insert-accept": ["INSERT INTO transplant_follow_up (transplant_id,recorded_by,follow_up_date,patient_status) VALUES (?, ?, UTC_DATE(),'Fictional stable')", [f.transplant, f.user]],
  };
  return map[name];
}
export async function demoState(db, f) {
  const tables = [
    ["organs", "SELECT organ_id,organ_status FROM organ WHERE donor_id=? ORDER BY organ_id", [f.donor]],
    ["registrations", "SELECT waiting_id,status,priority_level FROM waiting_list WHERE patient_id IN (?, ?) ORDER BY waiting_id", [f.patient, f.patient2]],
    ["matches", "SELECT match_id,waiting_id,organ_id,match_status FROM organ_match WHERE waiting_id IN (?, ?) ORDER BY match_id", [f.waiting, f.waiting2]],
    ["allocations", "SELECT allocation_id,allocation_status FROM organ_allocation WHERE match_id=? ORDER BY allocation_id", [f.match]],
    ["reservations", "SELECT organ_id,allocation_id FROM active_organ_reservation WHERE organ_id IN (?, ?) ORDER BY organ_id", [f.organ, f.wrongOrgan]],
    ["transplants", "SELECT transplant_id,allocation_id,notes FROM transplant WHERE centre_id=? ORDER BY transplant_id", [f.centre]],
    ["permanentRecords", "SELECT organ_id,transplant_id FROM organ_transplant_record WHERE organ_id IN (?, ?) ORDER BY organ_id", [f.organ, f.wrongOrgan]],
    ["compatibilityHistory", "SELECT test_id,match_id,remarks,overall_result FROM compatibility_test WHERE match_id=? ORDER BY test_id", [f.match]],
    ["followUps", "SELECT follow_up_id,patient_status FROM transplant_follow_up WHERE transplant_id=? ORDER BY follow_up_id", [f.transplant || "0"]],
    ["auditEvents", "SELECT audit_id,user_id,entity_name,action FROM audit_log WHERE (entity_name='organ_allocation' AND entity_id IN (SELECT allocation_id FROM organ_allocation WHERE match_id=?)) OR (entity_name='transplant' AND entity_id IN (SELECT transplant_id FROM transplant WHERE centre_id=?)) ORDER BY audit_id", [f.match, f.centre]],
    ["outboxEvents", "SELECT event_id,aggregate_type,event_type,status FROM sync_outbox WHERE (aggregate_type='organ_allocation' AND aggregate_id IN (SELECT allocation_id FROM organ_allocation WHERE match_id=?)) OR (aggregate_type='transplant' AND aggregate_id IN (SELECT transplant_id FROM transplant WHERE centre_id=?)) ORDER BY event_id", [f.match, f.centre]],
  ];
  const state = {}; for (const [key, sql, values] of tables) state[key] = (await db.execute(sql, values))[0]; return state;
}
