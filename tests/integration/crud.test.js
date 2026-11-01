import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
import { createRepository, getReferenceData } from "../../src/lib/repositories/record.repository.js";
import { createRecordService } from "../../src/lib/services/record.service.js";
import { collectionHandlers, itemHandlers } from "../../src/lib/api/records.js";

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

test("MySQL CRUD fixtures, references, audit/outbox and rollback preserve demo records", async () => {
  const pool = getMysqlPool();
  const db = await pool.getConnection();
  const counts = async () => (await db.query("SELECT (SELECT COUNT(*) FROM donor) donors, (SELECT COUNT(*) FROM patient) patients, (SELECT COUNT(*) FROM organ) organs, (SELECT COUNT(*) FROM audit_log) audits, (SELECT COUNT(*) FROM sync_outbox) events"))[0][0];
  const before = await counts();
  const envKeys = ["NODE_ENV", "ORGANSYNC_DEV_WRITES", "ORGANSYNC_DEV_WRITE_TOKEN"];
  const originalEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  const testToken = "fictional-rollback-only-token-123456789012345";
  process.env.NODE_ENV = "development";
  process.env.ORGANSYNC_DEV_WRITES = "true";
  process.env.ORGANSYNC_DEV_WRITE_TOKEN = testToken;
  let fixtureIds = [];
  try {
    await db.beginTransaction();
    const refs = await getReferenceData(db);
    assert.ok(refs.centres.length && refs.organTypes.length, "Existing reference data is required.");
    const centre_id = String(refs.centres[0].centre_id), organ_type_id = String(refs.organTypes[0].organ_type_id);
    // Inject the same connection: no inner operation can commit these fixtures.
    const service = Object.fromEntries(["donor", "patient", "organ"].map(entity => [entity, createRecordService(entity, createRepository(entity), work => work(db))]));
    async function write(entity, method, data, recordId) {
      const request = new Request(`http://localhost:3000/api/${entity}s${recordId ? `/${recordId}` : ""}`, { method, headers: { Authorization: `Bearer ${testToken}`, "Content-Type": "application/json" }, ...(method === "DELETE" ? {} : { body: JSON.stringify(data) }) });
      const handlers = method === "POST" ? collectionHandlers(service[entity]) : itemHandlers(service[entity]);
      const response = await handlers[method](request, { params: Promise.resolve({ id: String(recordId) }) });
      const body = await response.json();
      assert.equal(response.status, method === "POST" ? 201 : 200, JSON.stringify(body));
      return body.data;
    }
    const suffix = `${Date.now()}`;
    const donor = await write("donor", "POST", { centre_id, full_name: `Fictional Rollback Donor ${suffix}`, date_of_birth: "1995-01-01", blood_group: "O+", donor_type: "LIVING" });
    const patient = await write("patient", "POST", { centre_id, full_name: `Fictional Rollback Patient ${suffix}`, date_of_birth: "1998-02-03", blood_group: "A+", sex: "UNDISCLOSED" });
    const organ = await write("organ", "POST", { centre_id, organ_type_id, donor_id: String(donor.donor_id) });
    fixtureIds = [donor.donor_id, patient.patient_id, organ.organ_id];
    for (const [entity, row] of [["donor", donor], ["patient", patient], ["organ", organ]]) {
      assert.equal(String((await service[entity].get(String(row[`${entity}_id`]), db))[`${entity}_id`]), String(row[`${entity}_id`]));
      const listing = await service[entity].list({ page: "1", pageSize: "1", search: suffix }, db);
      assert.equal(listing.data.length, 1); assert.equal(listing.pagination.total, 1);
      assert.equal((await service[entity].list({ search: "%' OR 1=1 --" }, db)).data.length, 0);
    }
    assert.equal((await write("donor", "PATCH", { contact_phone: "9000000099" }, donor.donor_id)).contact_phone, "9000000099");
    assert.equal((await write("patient", "PATCH", { city: "Fictional Test City" }, patient.patient_id)).city, "Fictional Test City");
    assert.equal((await write("organ", "PATCH", { retrieved_at: "2020-01-01T12:00:00Z" }, organ.organ_id)).retrieved_at, "2020-01-01T12:00:00Z");
    await assert.rejects(service.donor.delete(String(donor.donor_id)), e => e.status === 409);
    await assert.rejects(service.organ.update(String(organ.organ_id), { organ_status: "RESERVED" }), e => e.status === 409);
    await assert.rejects(service.donor.update(String(donor.donor_id), { blood_group: "B+" }), e => e.status === 409);
    await assert.rejects(service.organ.create({ donor_id: "18446744073709551615", centre_id, organ_type_id }), e => e.code === "INVALID_REFERENCE");
    await assert.rejects(service.patient.create({ centre_id: "18446744073709551615", full_name: "Fictional Invalid", date_of_birth: "2000-01-01", blood_group: "O+", sex: "OTHER" }), e => e.code === "INVALID_REFERENCE");
    // Only fictional fixture records are ever referenced by these workflow tests.
    await db.execute("INSERT INTO waiting_list (patient_id, organ_type_id, centre_id, priority_level) VALUES (?, ?, ?, 3)", [patient.patient_id, organ_type_id, centre_id]);
    await db.execute("INSERT INTO organ_match (waiting_id, organ_id) SELECT waiting_id, ? FROM waiting_list WHERE patient_id = ?", [organ.organ_id, patient.patient_id]);
    await assert.rejects(service.organ.delete(String(organ.organ_id)), e => e.status === 409);
    await assert.rejects(service.organ.update(String(organ.organ_id), { retrieved_at: null }), e => e.status === 409);
    await db.execute("DELETE FROM organ_match WHERE organ_id = ?", [organ.organ_id]);
    // Reference a fictional patient, never update an existing waiting-list entry.
    await assert.rejects(service.patient.delete(String(patient.patient_id)), e => e.status === 409);
    await db.execute("DELETE FROM waiting_list WHERE patient_id = ?", [patient.patient_id]);
    await write("organ", "DELETE", undefined, organ.organ_id);
    await write("donor", "DELETE", undefined, donor.donor_id);
    await write("patient", "DELETE", undefined, patient.patient_id);
    await assert.rejects(service.organ.get(String(organ.organ_id), db), e => e.status === 404);
    const [[auditCount]] = await db.query("SELECT COUNT(*) AS total FROM audit_log");
    const [[eventCount]] = await db.query("SELECT COUNT(*) AS total FROM sync_outbox");
    assert.equal(Number(auditCount.total) - Number(before.audits), 9);
    assert.equal(Number(eventCount.total) - Number(before.events), 9);
    const [events] = await db.execute("SELECT payload FROM sync_outbox WHERE aggregate_type = 'donor' AND aggregate_id = ?", [donor.donor_id]);
    assert.doesNotMatch(JSON.stringify(events), /Fictional|900000|1995/);
  } finally {
    for (const key of envKeys) { if (originalEnv[key] === undefined) delete process.env[key]; else process.env[key] = originalEnv[key]; }
    await db.rollback();
    try {
      assert.deepEqual(await counts(), before, "All fixture and audit/outbox changes must be rolled back.");
      for (const [index, entity] of ["donor", "patient", "organ"].entries()) {
        if (fixtureIds[index]) assert.equal(await createRepository(entity).get(String(fixtureIds[index]), db), null);
      }
    } finally { db.release(); await pool.end(); }
  }
});
