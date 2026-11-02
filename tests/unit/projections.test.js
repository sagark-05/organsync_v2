import test from "node:test";
import assert from "node:assert/strict";
import { PROJECTIONS, projectionData, projectionId, projectionValidator } from "../../src/lib/sync/projection-schema.js";
import { projectionRepository } from "../../src/lib/repositories/projection.repository.js";
test("12 approved projection schemas expose only reviewed operational fields", () => {
  assert.equal(Object.keys(PROJECTIONS).length, 12);
  for (const [table, spec] of Object.entries(PROJECTIONS)) {
    const row = Object.fromEntries(spec.fields.map(field => [field, field.endsWith("_id") ? "7" : field === "is_active" ? 1 : field === "organ_name" ? "Kidney" : spec.enums[field][0]]));
    Object.assign(row, { full_name: "PRIVATE", password_hash: "SECRET", notes: "PRIVATE", patient_status: "PRIVATE", recorded_by: "99", performed_by: "99", blood_group: "O+", priority_level: 5 });
    const data = projectionData(table, row);
    assert.deepEqual(Object.keys(data), spec.fields);
    assert.equal(JSON.stringify(data).includes("PRIVATE"), false);
    assert.equal(projectionValidator(table).$jsonSchema.properties.data.additionalProperties, false);
  }
});
test("deterministic BIGINT projection identity and explicit tombstone data", () => {
  assert.equal(projectionId("donor", "18446744073709551615", "test"), "organsync-v2:test:donor:18446744073709551615");
  assert.equal(projectionData("donor", null), null);
  assert.throws(() => projectionData("donor", { donor_id: Number.MAX_SAFE_INTEGER + 1, centre_id: "1" }));
  assert.throws(() => projectionId("app_user", "1"));
});
test("source readers select only approved fields and bind primary keys", async () => {
  let statement, values;
  await projectionRepository.read({ execute: async (sql, params) => { statement = sql; values = params; return [[]]; } }, "medical_record", "123");
  assert.equal(statement, "SELECT `record_id`,`patient_id` FROM `medical_record` WHERE `record_id`=?");
  assert.deepEqual(values, ["123"]);
});
test("allocation and transplant events expand all indirectly changed projections", async () => {
  const db = { execute: async sql => [[sql.includes("FROM `transplant`") ? { transplant_id: "30", allocation_id: "20" } : sql.includes("FROM `organ_allocation`") ? { allocation_id: "20", match_id: "10" } : { match_id: "10", organ_id: "5", waiting_id: "6" }]] };
  assert.deepEqual(await projectionRepository.targets(db, { aggregate_type: "organ_allocation", aggregate_id: "20" }), [["organ", "5"], ["organ_allocation", "20"], ["waiting_list", "6"]]);
  assert.deepEqual(await projectionRepository.targets(db, { aggregate_type: "transplant", aggregate_id: "30" }), [["organ", "5"], ["organ_allocation", "20"], ["transplant", "30"], ["waiting_list", "6"]]);
  assert.deepEqual(await projectionRepository.targets(db, { aggregate_type: "app_session", aggregate_id: "1" }), []);
});
