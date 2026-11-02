import test from "node:test";
import assert from "node:assert/strict";
import { compatibilityInput, matchInput, matchUpdate, requireCompatible, requireTransition, waitingInput, workflowOptions } from "../../src/lib/validation/workflows.js";
import { compatibilityRepository } from "../../src/lib/repositories/compatibility.repository.js";
import { matchRepository } from "../../src/lib/repositories/match.repository.js";
import { recordMutation } from "../../src/lib/sync/outbox.js";
import { collectionHandlers, itemHandlers } from "../../src/lib/api/records.js";

const registration = { patient_id: "1", organ_type_id: "1", centre_id: "1", priority_level: 3 };
const evidence = { match_id: "1", performed_by: "1", blood_group_result: "COMPATIBLE", hla_result: "COMPATIBLE", overall_result: "COMPATIBLE" };
const bad = fn => assert.throws(fn, e => e.status === 400);
test("waiting registration validation respects fields, priority and workflow-owned states", () => {
  assert.equal(waitingInput(registration).status, "ACTIVE");
  for (const value of [0, 6, 1.5, null, true]) bad(() => waitingInput({ ...registration, priority_level: value }));
  for (const status of ["MATCHED", "COMPLETED", "CANCELLED"]) assert.throws(() => waitingInput({ ...registration, status }), e => e.status === 409);
  assert.deepEqual(waitingInput({ status: "CANCELLED" }, true), { status: "CANCELLED" });
  for (const status of ["ACTIVE", "MATCHED", "COMPLETED"]) assert.throws(() => waitingInput({ status }, true), e => e.status === 409);
  bad(() => waitingInput({ ...registration, active_patient_id: 1 }));
  bad(() => waitingInput({ ...registration, organ_type_id: "65536" }));
});
test("candidate input cannot set status, scores or change pair identity", () => {
  assert.deepEqual(matchInput({ organ_id: 1, waiting_id: "2" }), { organ_id: "1", waiting_id: "2" });
  bad(() => matchInput({ organ_id: 1, waiting_id: 2, match_status: "APPROVED" }));
  bad(() => matchInput({ organ_id: "1 OR 1=1", waiting_id: 2 }));
  bad(() => matchUpdate({ waiting_id: "1", match_status: "TESTING" }));
  assert.equal(matchUpdate({ match_status: "TESTING" }), "TESTING");
});
test("only documented match transitions are accepted", () => {
  for (const [from, to] of [["PROPOSED", "TESTING"], ["PROPOSED", "REJECTED"], ["TESTING", "APPROVED"], ["TESTING", "CANCELLED"], ["APPROVED", "CANCELLED"]]) requireTransition(from, to);
  for (const [from, to] of [["PROPOSED", "APPROVED"], ["APPROVED", "TESTING"], ["REJECTED", "TESTING"], ["CANCELLED", "PROPOSED"], ["TESTING", "TESTING"]]) assert.throws(() => requireTransition(from, to), e => e.status === 409);
});
test("untested, incompatible and internally inconsistent evidence cannot approve a match", () => {
  requireCompatible(evidence);
  for (const row of [null, { ...evidence, overall_result: "INCOMPATIBLE" }, { ...evidence, hla_result: "UNKNOWN" }, { ...evidence, blood_group_result: "INCOMPATIBLE" }]) assert.throws(() => requireCompatible(row), e => e.status === 409);
  assert.throws(() => compatibilityInput({ ...evidence, blood_group_result: "INCOMPATIBLE" }), e => e.status === 409);
});
test("compatibility input preserves append-only, server-dated history", () => {
  assert.equal(compatibilityInput(evidence).remarks, null);
  for (const extra of [{ test_date: "2020-01-01" }, { test_id: 1 }, { medical_score: 99 }]) bad(() => compatibilityInput({ ...evidence, ...extra }));
  bad(() => compatibilityInput({ ...evidence, performed_by: "0" }));
  bad(() => compatibilityInput({ ...evidence, hla_result: "POSITIVE" }));
  bad(() => compatibilityInput({ ...evidence, remarks: "界".repeat(22000) }));
});
test("workflow pagination and filters are bounded and validated", () => {
  assert.equal(workflowOptions("waiting", { priority_level: "5", status: "ACTIVE" }).priority_level, 5);
  for (const query of [{ page: "0" }, { pageSize: "101" }, { status: "UNKNOWN" }, { sort: "DROP TABLE" }]) bad(() => workflowOptions("waiting", query));
  bad(() => workflowOptions("candidates", { match_status: "APPROVED" }));
  assert.equal(workflowOptions("matches", { patient_id: "18446744073709551615" }).patient_id, "18446744073709551615");
});
test("candidate queries bind search and filter values; preview is read-only", async () => {
  const calls = [], hostile = "%' OR 1=1 --";
  const db = { execute: async (sql, values) => { calls.push([sql, values]); return [[{ total: "0" }]]; }, query: async (sql, values) => { calls.push([sql, values]); return [[]]; } };
  await matchRepository.candidates(workflowOptions("candidates", { search: hostile, centre_id: "1" }), db);
  for (const [sql, values] of calls) { assert.ok(sql.startsWith("SELECT")); assert.ok(!sql.includes(hostile)); assert.ok(values.includes(hostile)); assert.ok(!sql.includes("SELECT *")); }
  assert.match(calls[0][0], /w\.status = 'ACTIVE'/); assert.match(calls[0][0], /o\.organ_status = 'AVAILABLE'/); assert.match(calls[0][0], /o\.organ_type_id = w\.organ_type_id/);
});
test("audit/outbox helper uses actual primary keys without altering Phase 3C format", async () => {
  for (const [entity, key] of [["donor", "donor_id"], ["waiting_list", "waiting_id"], ["organ_match", "match_id"], ["compatibility_test", "test_id"]]) {
    const calls = [];
    await recordMutation({ execute: async (...args) => calls.push(args) }, entity, "42", "CREATED");
    assert.equal(calls.length, 2); assert.equal(calls[1][1][2], `${entity.toUpperCase()}_CREATED`);
    assert.deepEqual(JSON.parse(calls[1][1][3]), { [key]: "42", action: "CREATED" });
  }
});
test("compatibility repository never reads authentication secrets", async () => {
  const sql = [];
  const db = { query: async query => { sql.push(query); return [[]]; } };
  assert.deepEqual(await compatibilityRepository.clinicians(db), []);
  assert.doesNotMatch(sql[0], /password_hash|email|SELECT \*/);
  assert.match(sql[0], /role = 'CLINICIAN'/);
});
test("all new collection and item writes reuse the development guard", async () => {
  const old = process.env.ORGANSYNC_DEV_WRITES; process.env.ORGANSYNC_DEV_WRITES = "false";
  try {
    const service = { create: () => assert.fail("write ran"), update: () => assert.fail("write ran"), delete: () => assert.fail("write ran") };
    for (const path of ["waiting-list", "matches", "compatibility-tests"]) {
      const context = { params: Promise.resolve({ id: "1" }) };
      for (const method of ["POST", "PATCH", "DELETE"]) {
        const handlers = method === "POST" ? collectionHandlers(service) : itemHandlers(service);
        const response = await handlers[method](new Request(`http://localhost/api/${path}`, { method }), context);
        assert.equal(response.status, 403);
      }
    }
  } finally { if (old === undefined) delete process.env.ORGANSYNC_DEV_WRITES; else process.env.ORGANSYNC_DEV_WRITES = old; }
});
