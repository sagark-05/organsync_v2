import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
import { createRepository, getReferenceData } from "../../src/lib/repositories/record.repository.js";
import { createRecordService } from "../../src/lib/services/record.service.js";
import { createWaitingListService } from "../../src/lib/services/waiting-list.service.js";
import { createMatchingService } from "../../src/lib/services/matching.service.js";
import { createCompatibilityService } from "../../src/lib/services/compatibility.service.js";
import { collectionHandlers, itemHandlers } from "../../src/lib/api/records.js";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
test("Phase 3D database integrity and API writes use only rollback-controlled fictional fixtures", async t => {
  const pool = getMysqlPool(), db = await pool.getConnection();
  const count = async () => (await db.query("SELECT (SELECT COUNT(*) FROM donor) donors, (SELECT COUNT(*) FROM patient) patients, (SELECT COUNT(*) FROM organ) organs, (SELECT COUNT(*) FROM waiting_list) waiting, (SELECT COUNT(*) FROM organ_match) matches, (SELECT COUNT(*) FROM compatibility_test) tests, (SELECT COUNT(*) FROM audit_log) audits, (SELECT COUNT(*) FROM sync_outbox) events, (SELECT COUNT(*) FROM app_user) users"))[0][0];
  const before = await count();
  const oldEnv = Object.fromEntries(["NODE_ENV", "ORGANSYNC_DEV_WRITES", "ORGANSYNC_DEV_WRITE_TOKEN"].map(key => [key, process.env[key]]));
  const token = "fictional-phase3d-rollback-test-token-123456789";
  Object.assign(process.env, { NODE_ENV: "development", ORGANSYNC_DEV_WRITES: "true", ORGANSYNC_DEV_WRITE_TOKEN: token });
  let compatibilityExercised = false;
  try {
    await db.beginTransaction();
    // Each service operation is atomic within the outer, never-committed fixture transaction.
    const transaction = async work => {
      await db.query("SAVEPOINT phase3d_operation");
      try { const result = await work(db); await db.query("RELEASE SAVEPOINT phase3d_operation"); return result; }
      catch (e) { await db.query("ROLLBACK TO SAVEPOINT phase3d_operation"); await db.query("RELEASE SAVEPOINT phase3d_operation"); throw e; }
    };
    const refs = await getReferenceData(db); assert.ok(refs.centres.length && refs.organTypes.length >= 2);
    const centre_id = String(refs.centres[0].centre_id), organ_type_id = String(refs.organTypes[0].organ_type_id), otherType = String(refs.organTypes[1].organ_type_id);
    const people = Object.fromEntries(["donor", "patient", "organ"].map(entity => [entity, createRecordService(entity, createRepository(entity), transaction)]));
    const waiting = createWaitingListService(transaction), matching = createMatchingService(transaction), compatibility = createCompatibilityService(transaction);
    async function write(service, method, data, recordId, expected = method === "POST" ? 201 : 200) {
      const req = new Request("http://localhost:3000/api/fixture", { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, ...(method === "DELETE" ? {} : { body: JSON.stringify(data) }) });
      const response = await (method === "POST" ? collectionHandlers(service) : itemHandlers(service))[method](req, { params: Promise.resolve({ id: String(recordId) }) });
      const body = await response.json(); assert.equal(response.status, expected, JSON.stringify(body)); return body.data || body.error;
    }
    const suffix = String(Date.now());
    const donor = await people.donor.create({ centre_id, full_name: `Fictional Phase3D Donor ${suffix}`, date_of_birth: "1990-01-01", blood_group: "O+", donor_type: "DECEASED" });
    const patient = await people.patient.create({ centre_id, full_name: `Fictional Phase3D Patient ${suffix}`, date_of_birth: "1995-01-01", blood_group: "O+", sex: "UNDISCLOSED" });
    const organ = await people.organ.create({ centre_id, donor_id: String(donor.donor_id), organ_type_id });
    const wrongOrgan = await people.organ.create({ centre_id, donor_id: String(donor.donor_id), organ_type_id: otherType });
    const input = { patient_id: String(patient.patient_id), centre_id, organ_type_id, priority_level: 4 };
    const registration = await write(waiting, "POST", input);
    const wid = String(registration.waiting_id);
    await write(waiting, "POST", input, undefined, 409);
    await assert.rejects(db.execute("INSERT INTO waiting_list (patient_id, organ_type_id, centre_id, priority_level) VALUES (?, ?, ?, 4)", [patient.patient_id, organ_type_id, centre_id]), e => e.code === "ER_DUP_ENTRY");
    await assert.rejects(db.execute("INSERT INTO waiting_list (patient_id, organ_type_id, centre_id, priority_level) VALUES (?, ?, ?, 6)", [patient.patient_id, otherType, centre_id]), e => e.code === "ER_CHECK_CONSTRAINT_VIOLATED");
    await write(waiting, "PATCH", { status: "MATCHED" }, wid, 409);
    await write(waiting, "PATCH", { priority_level: 5 }, wid);
    assert.equal((await waiting.list({ patient_id: String(patient.patient_id), priority_level: "5", status: "ACTIVE" }, db)).pagination.total, 1);
    assert.equal((await matching.candidates({ patient_id: String(patient.patient_id), organ_id: String(organ.organ_id) }, db)).pagination.total, 1);
    await write(matching, "POST", { waiting_id: wid, organ_id: String(wrongOrgan.organ_id) }, undefined, 409);
    await assert.rejects(db.execute("INSERT INTO organ_match (waiting_id, organ_id) VALUES (?, ?)", [wid, wrongOrgan.organ_id]), e => e.code === "ER_SIGNAL_EXCEPTION");
    const proposed = await write(matching, "POST", { waiting_id: wid, organ_id: String(organ.organ_id) });
    const mid = String(proposed.match_id);
    await write(matching, "POST", { waiting_id: wid, organ_id: String(organ.organ_id) }, undefined, 409);
    assert.equal((await matching.candidates({ patient_id: String(patient.patient_id), organ_id: String(organ.organ_id) }, db)).pagination.total, 0);
    await write(waiting, "PATCH", { priority_level: 2 }, wid, 409);
    await write(waiting, "DELETE", undefined, wid, 409);
    await write(matching, "PATCH", { match_status: "APPROVED" }, mid, 409);
    await write(matching, "PATCH", { match_status: "TESTING" }, mid);
    await write(matching, "PATCH", { match_status: "APPROVED" }, mid, 409);
    await assert.rejects(db.execute("UPDATE organ_match SET match_status = 'APPROVED' WHERE match_id = ?", [mid]), e => e.code === "ER_SIGNAL_EXCEPTION");
    const clinicians = await compatibility.clinicians(db);
    const evidence = { match_id: mid, performed_by: clinicians.length ? String(clinicians[0].user_id) : "18446744073709551615", blood_group_result: "COMPATIBLE", hla_result: "COMPATIBLE", overall_result: "COMPATIBLE", remarks: "Fictional rollback-only educational evidence" };
    if (!clinicians.length) {
      const error = await write(compatibility, "POST", evidence, undefined, 409);
      assert.equal(error.code, "CLINICIAN_REQUIRED");
      t.diagnostic("No active clinician exists: positive compatibility inserts and actual-MySQL compatible approval are blocked; no user was fabricated.");
    } else {
      compatibilityExercised = true;
      await write(compatibility, "POST", { ...evidence, overall_result: "INCOMPATIBLE", blood_group_result: "INCOMPATIBLE" });
      await write(matching, "PATCH", { match_status: "APPROVED" }, mid, 409);
      await write(compatibility, "POST", evidence);
      assert.equal((await compatibility.list({ match_id: mid }, db)).pagination.total, 2);
      await write(matching, "PATCH", { match_status: "APPROVED" }, mid);
      await write(compatibility, "POST", evidence, undefined, 409);
    }
    await write(matching, "PATCH", { match_status: "CANCELLED" }, mid);
    await write(matching, "PATCH", { match_status: "TESTING" }, mid, 409);
    const disposable = await write(waiting, "POST", { ...input, organ_type_id: otherType });
    await write(waiting, "PATCH", { status: "CANCELLED" }, String(disposable.waiting_id));
    await write(waiting, "DELETE", undefined, String(disposable.waiting_id));
    // Force an outbox failure after actual business and audit INSERTs. Savepoint rollback must remove both.
    const faultCounts = await count();
    const faultyDb = { execute: (sql, values) => { if (sql.startsWith("INSERT INTO sync_outbox")) throw new Error("Injected outbox failure"); return db.execute(sql, values); }, query: (...args) => db.query(...args) };
    const failing = createWaitingListService(work => transaction(() => work(faultyDb)));
    await assert.rejects(failing.create({ ...input, organ_type_id: otherType }), /Injected outbox failure/);
    assert.deepEqual(await count(), faultCounts);
    const [events] = await db.execute("SELECT payload FROM sync_outbox WHERE aggregate_type = 'organ_match' AND aggregate_id = ?", [mid]);
    assert.ok(events.length >= 3); assert.ok(events.every(row => Object.hasOwn(typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload, "match_id")));
    assert.equal((await people.organ.get(String(organ.organ_id), db)).organ_status, "AVAILABLE");
    assert.equal((await waiting.get(wid, db)).status, "ACTIVE");
    assert.equal((await compatibility.list({ match_id: mid }, db)).pagination.total, compatibilityExercised ? 2 : 0);
  } finally {
    for (const [key, value] of Object.entries(oldEnv)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    await db.rollback();
    try { assert.deepEqual(await count(), before, "All data/audit/outbox/user counts must be unchanged after rollback."); }
    finally { db.release(); await pool.end(); }
  }
});
