import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
import { demoFixtures } from "../../src/lib/repositories/demo.repository.js";
import { createAllocationService } from "../../src/lib/services/allocation.service.js";
import { createTransplantService } from "../../src/lib/services/transplant.service.js";
import { createFollowUpService } from "../../src/lib/services/follow-up.service.js";
import { setupClinician, signInClinician, requireClinicianSession } from "../../src/lib/auth/clinician.js";
import { clinicalCollection } from "../../src/lib/api/phase3e.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

test("Phase 3E clinician authentication, allocate/release/transplant/follow-up and atomic rollback", async () => {
  const pool = getMysqlPool(), db = await pool.getConnection();
  const count = async () => (await db.query("SELECT (SELECT COUNT(*) FROM donor) donors,(SELECT COUNT(*) FROM patient) patients,(SELECT COUNT(*) FROM organ) organs,(SELECT COUNT(*) FROM app_user) users,(SELECT COUNT(*) FROM app_session) sessions,(SELECT COUNT(*) FROM transplant) transplants,(SELECT COUNT(*) FROM organ_allocation) allocations,(SELECT COUNT(*) FROM audit_log) audits,(SELECT COUNT(*) FROM sync_outbox) events"))[0][0];
  const before = await count();
  const oldEnv = Object.fromEntries(["NODE_ENV", "ORGANSYNC_DEV_WRITES", "ORGANSYNC_DEV_WRITE_TOKEN"].map(key => [key, process.env[key]]));
  const devToken = "fictional-phase3e-rollback-token-123456789012345";
  Object.assign(process.env, { NODE_ENV: "development", ORGANSYNC_DEV_WRITES: "true", ORGANSYNC_DEV_WRITE_TOKEN: devToken });
  try {
    await db.beginTransaction();
    const transaction = async work => { await db.query("SAVEPOINT clinical_operation"); try { const result = await work(db); await db.query("RELEASE SAVEPOINT clinical_operation"); return result; } catch (e) { await db.query("ROLLBACK TO SAVEPOINT clinical_operation"); await db.query("RELEASE SAVEPOINT clinical_operation"); throw e; } };
    const f = await demoFixtures(db);
    const [routines] = await db.query("SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_NAME IN ('sp_allocate_organ_tx','sp_release_allocation_tx','sp_record_transplant_tx')");
    const installedProcedures = routines.length === 3;
    const identity = { full_name: "Explicit Fictional Rollback Clinician", email: `${randomUUID()}@rollback.invalid`, password: "Fictional-rollback-only-Password-987", confirm_fictional: true };
    const actor = await setupClinician(identity, transaction);
    await assert.rejects(signInClinician({ email: identity.email, password: "Incorrect-password-1234" }, transaction), e => e.status === 401);
    const session = await signInClinician({ email: identity.email, password: identity.password }, transaction);
    const authedRequest = (data, token = session.session) => new Request("http://localhost:3000/api/allocations", { method: "POST", headers: { Authorization: `Bearer ${devToken}`, "X-Clinician-Session": token, "Content-Type": "application/json" }, body: JSON.stringify(data) });
    assert.equal(String((await requireClinicianSession(authedRequest({}), db)).user_id), String(actor.user_id));
    const allocations = createAllocationService(transaction), transplants = createTransplantService(transaction), followups = createFollowUpService(transaction);
    const api = clinicalCollection(allocations, request => requireClinicianSession(request, db));
    assert.equal((await api.POST(authedRequest({ match_id: f.match }, "bad-session"))).status, 401);
    await assert.rejects(allocations.create({ match_id: f.match }, actor.user_id), e => e.status === 409);
    await db.execute("UPDATE organ_match SET match_status='TESTING' WHERE match_id=?", [f.match]);
    await db.execute("INSERT INTO compatibility_test (match_id,performed_by,blood_group_result,hla_result,overall_result) VALUES (?, ?, 'INCOMPATIBLE','COMPATIBLE','INCOMPATIBLE')", [f.match, actor.user_id]);
    await assert.rejects(db.execute("UPDATE organ_match SET match_status='APPROVED' WHERE match_id=?", [f.match]), e => e.errno === 1644);
    await db.execute("INSERT INTO compatibility_test (match_id,performed_by,blood_group_result,hla_result,overall_result) VALUES (?, ?, 'COMPATIBLE','COMPATIBLE','COMPATIBLE')", [f.match, actor.user_id]);
    await db.execute("UPDATE organ_match SET match_status='APPROVED' WHERE match_id=?", [f.match]);
    const response = await api.POST(authedRequest({ match_id: f.match })); assert.equal(response.status, 201);
    const allocated = (await response.json()).data;
    assert.equal(allocated.execution, installedProcedures ? "stored_procedure" : "application_transaction");
    await assert.rejects(allocations.create({ match_id: f.match }, actor.user_id), e => e.status === 409);
    assert.equal((await allocations.release(String(allocated.allocation_id), actor.user_id)).allocation_status, "RELEASED");
    await assert.rejects(allocations.release(String(allocated.allocation_id), actor.user_id), e => e.status === 409);
    const again = await allocations.create({ match_id: f.match }, actor.user_id);
    const input = { allocation_id: String(again.allocation_id), centre_id: f.centre, performed_at: new Date().toISOString().slice(0, 19) + "Z", outcome: "SUCCESSFUL", notes: "Fictional rollback-only transplant" };
    await assert.rejects(transplants.create({ ...input, performed_at: "2000-01-01T00:00:00Z" }, actor.user_id), e => e.status === 409);
    const transplant = await transplants.create(input, actor.user_id);
    assert.equal(transplant.execution, installedProcedures ? "stored_procedure" : "application_transaction");
    await assert.rejects(transplants.create(input, actor.user_id), e => e.status === 409);
    await assert.rejects(allocations.release(String(again.allocation_id), actor.user_id), e => e.status === 409);
    await assert.rejects(followups.create({ transplant_id: String(transplant.transplant_id), follow_up_date: "2000-01-01", patient_status: "Fictional stable" }, actor.user_id), e => e.status === 409);
    const followup = await followups.create({ transplant_id: String(transplant.transplant_id), follow_up_date: new Date().toISOString().slice(0, 10), patient_status: "Fictional stable", notes: "Educational only" }, actor.user_id);
    assert.equal(String(followup.recorded_by), String(actor.user_id));
    assert.equal((await followups.list({ transplant_id: String(transplant.transplant_id) }, db)).pagination.total, 1);
    assert.equal((await allocations.get(String(again.allocation_id), db)).allocation_status, "COMPLETED");
    assert.equal((await db.execute("SELECT organ_status FROM organ WHERE organ_id=?", [f.organ]))[0][0].organ_status, "TRANSPLANTED");
    assert.equal((await db.execute("SELECT status FROM waiting_list WHERE waiting_id=?", [f.waiting]))[0][0].status, "COMPLETED");
    assert.equal((await db.execute("SELECT organ_id FROM active_organ_reservation WHERE organ_id=?", [f.organ]))[0].length, 0);
    assert.equal((await db.execute("SELECT transplant_id FROM organ_transplant_record WHERE organ_id=?", [f.organ]))[0].length, 1);
    const snapshot = await count();
    const faultyDb = { execute: (sql, values) => { if (sql.startsWith("INSERT INTO sync_outbox")) throw new Error("Injected Phase3E outbox failure"); return db.execute(sql, values); }, query: (...args) => db.query(...args) };
    const faulty = createFollowUpService(work => transaction(() => work(faultyDb)));
    await assert.rejects(faulty.create({ transplant_id: String(transplant.transplant_id), follow_up_date: new Date().toISOString().slice(0, 10), patient_status: "Fictional retry" }, actor.user_id), /Injected Phase3E outbox failure/);
    assert.deepEqual(await count(), snapshot);
  } finally {
    for (const [key, value] of Object.entries(oldEnv)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    await db.rollback(); try { assert.deepEqual(await count(), before); } finally { db.release(); await pool.end(); }
  }
});
