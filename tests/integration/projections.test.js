import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { MongoClient } from "mongodb";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../../src/lib/db/mongodb.js";
import { donorService } from "../../src/lib/services/donor.service.js";
import { patientService } from "../../src/lib/services/patient.service.js";
import { organService } from "../../src/lib/services/organ.service.js";
import { waitingListService } from "../../src/lib/services/waiting-list.service.js";
import { matchingService } from "../../src/lib/services/matching.service.js";
import { compatibilityService } from "../../src/lib/services/compatibility.service.js";
import { allocationService } from "../../src/lib/services/allocation.service.js";
import { transplantService } from "../../src/lib/services/transplant.service.js";
import { followUpService } from "../../src/lib/services/follow-up.service.js";
import { createSyncWorker } from "../../src/lib/sync/worker.js";
import { createAtlasSink } from "../../src/lib/sync/atlas-sink.js";
import { syncRepository } from "../../src/lib/repositories/sync.repository.js";
import { projectionRepository } from "../../src/lib/repositories/projection.repository.js";
import { createProjector } from "../../src/lib/sync/projections.js";
import { PROJECTIONS, projectionId } from "../../src/lib/sync/projection-schema.js";
import { runProjectionJob } from "../../src/lib/sync/projection-jobs.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

test("approved business projections: real MySQL/Atlas backfill, fencing and workflows", { timeout: 300000 }, async t => {
  const pool = getMysqlPool(), atlas = await getMongoDatabase(), projector = createProjector(), tag = randomUUID().slice(0, 8), evidence = {};
  const [[max]] = await pool.query("SELECT COALESCE(MAX(event_id),0) id FROM sync_outbox");
  const [centres] = await pool.query("SELECT centre_id FROM transplant_centre WHERE is_active=TRUE ORDER BY centre_id LIMIT 2");
  const [[clinician]] = await pool.query("SELECT user_id FROM app_user WHERE is_active=TRUE AND role='CLINICIAN' ORDER BY user_id LIMIT 1");
  assert.equal(centres.length, 2); assert.ok(clinician); process.env.ORGANSYNC_BUSINESS_PROJECTIONS = "true";
  const a = String(centres[0].centre_id), b = String(centres[1].centre_id);
  const donorInput = suffix => ({ full_name: `Fictional Projection ${tag} ${suffix}`, centre_id: a, date_of_birth: "1990-01-01", blood_group: "O+", donor_type: "LIVING" });
  const document = (table, id) => atlas.collection(PROJECTIONS[table].collection).findOne({ _id: projectionId(table, id) });
  const event = async (table, id) => (await pool.execute("SELECT * FROM sync_outbox WHERE aggregate_type=? AND aggregate_id=? ORDER BY event_id DESC LIMIT 1", [table, id]))[0][0];
  const deliver = async (table, id) => { const e = await event(table, id); const result = await createSyncWorker().runOnce({ eventId: String(e.event_id) }); assert.equal(result.outcome, "delivered", JSON.stringify(result)); return e; };
  let donor, deleteCandidate;
  try {
    await t.test("historical backfill is complete, restart-safe and leaves the empty medical table empty", async () => {
      const snapshot = JSON.parse(await fs.readFile(".artifacts/projection-backfill-evidence.json", "utf8")); assert.equal(snapshot.activeTotal, 39);
      assert.equal((await runProjectionJob("backfill", { approveBackfill: true })).alreadyCompleted, true);
      assert.equal(await atlas.collection("medical_records").countDocuments(), 0);
      for (const mapping of Object.values(PROJECTIONS)) assert.ok((await atlas.listCollections({ name: mapping.collection }).toArray()).length === 1);
    });
    await t.test("committed INSERT and duplicate replay create one sanitized business document", async () => {
      donor = await donorService.create(donorInput("mutable")); evidence.mutableDonorId = String(donor.donor_id);
      const e = await deliver("donor", donor.donor_id); await projector.refreshEvent(e, pool);
      assert.equal(await atlas.collection("donors").countDocuments({ _id: projectionId("donor", donor.donor_id) }), 1);
      assert.deepEqual((await document("donor", donor.donor_id)).data, { donor_id: String(donor.donor_id), centre_id: a });
    });
    await t.test("out-of-order notifications read current state rather than resurrecting old values", async () => {
      await donorService.update(donor.donor_id, { centre_id: b }); const older = await event("donor", donor.donor_id);
      await donorService.update(donor.donor_id, { centre_id: a }); const newer = await event("donor", donor.donor_id);
      assert.equal((await createSyncWorker().runOnce({ eventId: String(newer.event_id) })).outcome, "delivered");
      assert.equal((await createSyncWorker().runOnce({ eventId: String(older.event_id) })).outcome, "delivered");
      assert.equal((await document("donor", donor.donor_id)).data.centre_id, a);
    });
    await t.test("concurrent claim is rejected; expired stale writer is fenced after a fresh write", async () => {
      const short = createProjector({ leaseMs: 250 }), oldClaim = await short.claim("donor", donor.donor_id), oldRow = await projectionRepository.read(pool, "donor", donor.donor_id);
      await assert.rejects(projector.claim("donor", donor.donor_id), e => e.syncCode === "PROJECTION_BUSY");
      await donorService.update(donor.donor_id, { centre_id: b }); await setTimeout(300);
      await projector.refresh("donor", donor.donor_id, pool);
      await assert.rejects(short.publish(oldClaim, oldRow), e => e.syncCode === "PROJECTION_FENCED");
      assert.equal((await document("donor", donor.donor_id)).data.centre_id, b);
    });
    await t.test("source read failure never becomes a deletion tombstone", async () => {
      const failing = createProjector({ repository: { ...projectionRepository, read: async () => { throw new Error("Injected read failure"); } } });
      await assert.rejects(failing.refresh("donor", donor.donor_id, pool)); assert.equal((await document("donor", donor.donor_id))._sync.deleted, false);
    });
    await t.test("real driver outage after event persistence does not acknowledge business delivery or undo producer commit", async () => {
      await donorService.update(donor.donor_id, { centre_id: a }); const e = await event("donor", donor.donor_id);
      const badClient = new MongoClient("mongodb://127.0.0.1:1", { tls: true, serverSelectionTimeoutMS: 300, connectTimeoutMS: 300 });
      try {
        const unavailable = createProjector({ database: async () => { await badClient.connect(); return badClient.db("unreachable"); } });
        const result = await createSyncWorker({ projector: unavailable }).runOnce({ eventId: String(e.event_id) });
        assert.equal(result.outcome, "failed"); assert.equal(result.code, "ATLAS_UNAVAILABLE");
        assert.equal((await donorService.get(donor.donor_id)).centre_id, a);
        assert.equal((await pool.execute("SELECT status FROM sync_outbox WHERE event_id=?", [e.event_id]))[0][0].status, "FAILED");
        await pool.execute("UPDATE sync_outbox SET processed_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE event_id=?", [e.event_id]);
        assert.equal((await createSyncWorker().runOnce({ eventId: String(e.event_id) })).outcome, "delivered");
        assert.equal((await document("donor", donor.donor_id)).data.centre_id, a);
      } finally { await badClient.close(); }
    });
    await t.test("crash after projection persistence and before MySQL commit replays idempotently", async () => {
      await donorService.update(donor.donor_id, { centre_id: b }); const e = await event("donor", donor.donor_id), db = await pool.getConnection();
      try { await db.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED"); await db.beginTransaction(); const claimed = await syncRepository.claim(db, { eventId: String(e.event_id) }); await createAtlasSink().persist(claimed, await syncRepository.audits(db, claimed)); await projector.refreshEvent(claimed, db); }
      finally { db.destroy(); }
      let result; for (let attempt = 0; attempt < 30; attempt++) { result = await createSyncWorker().runOnce({ eventId: String(e.event_id) }); if (result.outcome !== "idle") break; await setTimeout(100); }
      assert.equal(result.outcome, "delivered"); assert.equal(await atlas.collection("donors").countDocuments({ _id: projectionId("donor", donor.donor_id) }), 1);
    });
    await t.test("explicit deletion and an older creation notification cannot resurrect a deleted row", async () => {
      deleteCandidate = await donorService.create(donorInput("explicit-disposable")); const creation = await event("donor", deleteCandidate.donor_id);
      await donorService.delete(deleteCandidate.donor_id); await deliver("donor", deleteCandidate.donor_id);
      assert.equal((await createSyncWorker().runOnce({ eventId: String(creation.event_id) })).outcome, "delivered");
      const tombstone = await document("donor", deleteCandidate.donor_id); assert.equal(tombstone.data, null); assert.equal(tombstone._sync.state, "deleted"); evidence.explicitDeleteDonorId = String(deleteCandidate.donor_id);
    });
    await t.test("allocation, release, transplant and follow-up refresh every dependent business document", async () => {
      const d = await donorService.create(donorInput("journey"));
      const p = await patientService.create({ full_name: `Fictional Projection Patient ${tag}`, centre_id: a, date_of_birth: "1991-01-01", sex: "UNDISCLOSED", blood_group: "O+" });
      const [[kind]] = await pool.query("SELECT organ_type_id FROM organ_type WHERE is_active=TRUE ORDER BY organ_type_id LIMIT 1");
      const o = await organService.create({ donor_id: String(d.donor_id), organ_type_id: String(kind.organ_type_id), centre_id: a });
      const w = await waitingListService.create({ patient_id: String(p.patient_id), organ_type_id: String(kind.organ_type_id), centre_id: a, priority_level: "3" });
      const m = await matchingService.create({ waiting_id: String(w.waiting_id), organ_id: String(o.organ_id) });
      await matchingService.update(m.match_id, { match_status: "TESTING" });
      await compatibilityService.create({ match_id: String(m.match_id), performed_by: String(clinician.user_id), blood_group_result: "COMPATIBLE", hla_result: "COMPATIBLE", overall_result: "COMPATIBLE" });
      await matchingService.update(m.match_id, { match_status: "APPROVED" });
      const allocation = await allocationService.create({ match_id: String(m.match_id) }, String(clinician.user_id)); await deliver("organ_allocation", allocation.allocation_id);
      assert.equal((await document("organ", o.organ_id)).data.organ_status, "RESERVED"); assert.equal((await document("waiting_list", w.waiting_id)).data.status, "MATCHED");
      await allocationService.release(allocation.allocation_id, String(clinician.user_id)); await deliver("organ_allocation", allocation.allocation_id);
      assert.equal((await document("organ", o.organ_id)).data.organ_status, "AVAILABLE"); assert.equal((await document("waiting_list", w.waiting_id)).data.status, "ACTIVE");
      const reserved = await allocationService.create({ match_id: String(m.match_id) }, String(clinician.user_id));
      const tr = await transplantService.create({ allocation_id: String(reserved.allocation_id), centre_id: a, performed_at: new Date().toISOString().slice(0, 19) + "Z", outcome: "SUCCESSFUL", notes: "Fictional projection integration" }, String(clinician.user_id)); await deliver("transplant", tr.transplant_id);
      assert.equal((await document("organ", o.organ_id)).data.organ_status, "TRANSPLANTED"); assert.equal((await document("waiting_list", w.waiting_id)).data.status, "COMPLETED"); assert.equal((await document("organ_allocation", reserved.allocation_id)).data.allocation_status, "COMPLETED");
      assert.deepEqual(Object.keys((await document("transplant", tr.transplant_id)).data), ["transplant_id", "allocation_id", "centre_id"]);
      const follow = await followUpService.create({ transplant_id: String(tr.transplant_id), follow_up_date: new Date().toISOString().slice(0, 10), patient_status: "Fictional stable" }, String(clinician.user_id)); await deliver("transplant_follow_up", follow.follow_up_id);
      assert.deepEqual((await document("transplant_follow_up", follow.follow_up_id)).data, { follow_up_id: String(follow.follow_up_id), transplant_id: String(tr.transplant_id) });
      evidence.journey = { donor: String(d.donor_id), patient: String(p.patient_id), organ: String(o.organ_id), waiting: String(w.waiting_id), match: String(m.match_id), transplant: String(tr.transplant_id), followUp: String(follow.follow_up_id) };
    });
    await t.test("reconciliation resumes a failed checkpoint and captures bypassed updates/deletes", async () => {
      await pool.execute("UPDATE donor SET centre_id=? WHERE donor_id=?", [a, donor.donor_id]);
      let calls = 0;
      const partial = { ensureAll: () => projector.ensureAll(), refresh: async (...args) => { if (++calls === 3) throw new Error("Injected checkpoint interruption"); return projector.refresh(...args); } };
      await assert.rejects(runProjectionJob("reconcile", { projector: partial }));
      const failed = await atlas.collection("projection_sync_state").findOne({ mode: "reconcile" }); assert.equal(failed.state, "failed"); assert.ok(failed.progress.donor.processed >= 2);
      assert.equal((await runProjectionJob("reconcile")).state, "completed"); assert.equal((await document("donor", donor.donor_id)).data.centre_id, a);
      await pool.execute("DELETE FROM donor WHERE donor_id=?", [donor.donor_id]);
      assert.equal((await runProjectionJob("reconcile")).state, "completed"); assert.equal((await document("donor", donor.donor_id))._sync.deleted, true);
      assert.equal(await atlas.collection("medical_records").countDocuments(), 0);
    });
  } finally {
    // Drain only events generated by this test; never reset historical delivered rows.
    const [pending] = await pool.execute("SELECT event_id FROM sync_outbox WHERE event_id>? AND status<>'DELIVERED' ORDER BY event_id", [max.id]);
    for (const e of pending) { await pool.execute("UPDATE sync_outbox SET processed_at=NULL WHERE event_id=? AND status='FAILED'", [e.event_id]); const result = await createSyncWorker().runOnce({ eventId: String(e.event_id) }); assert.equal(result.outcome, "delivered", JSON.stringify(result)); }
    await fs.writeFile(".artifacts/projection-integration-evidence.json", JSON.stringify(evidence, null, 2)); console.log(JSON.stringify({ projectionIntegrationEvidence: evidence }));
    await closeMongoConnection(); await pool.end();
  }
});
