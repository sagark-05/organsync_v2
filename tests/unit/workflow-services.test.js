import test from "node:test";
import assert from "node:assert/strict";
import { matchRepository } from "../../src/lib/repositories/match.repository.js";
import { compatibilityRepository } from "../../src/lib/repositories/compatibility.repository.js";
import { createMatchingService } from "../../src/lib/services/matching.service.js";
import { createCompatibilityService } from "../../src/lib/services/compatibility.service.js";

// These are isolated in-memory mocks, not app_user inserts or database fixtures.
function context(t, status = "TESTING") {
  const state = { match: { match_id: "1", organ_id: "2", waiting_id: "3", match_status: status }, evidence: null, competing: false, allocated: false, writes: [], clinicians: [] };
  t.mock.method(matchRepository, "get", async () => ({ ...state.match }));
  t.mock.method(matchRepository, "lock", async () => ({ ...state.match }));
  t.mock.method(matchRepository, "competingApproval", async () => state.competing);
  t.mock.method(matchRepository, "update", async (value, next) => { state.writes.push("match"); state.match.match_status = next; });
  t.mock.method(compatibilityRepository, "latest", async () => state.evidence);
  t.mock.method(compatibilityRepository, "clinicians", async () => state.clinicians);
  t.mock.method(compatibilityRepository, "clinician", async value => state.clinicians.find(row => row.user_id === value));
  t.mock.method(compatibilityRepository, "create", async () => { state.writes.push("test"); return "9"; });
  t.mock.method(compatibilityRepository, "get", async () => ({ test_id: "9", match_id: "1" }));
  const db = { execute: async sql => {
    if (sql.startsWith("SELECT organ_id, organ_type_id")) return [[{ organ_id: "2", organ_type_id: "4", organ_status: "AVAILABLE" }]];
    if (sql.startsWith("SELECT waiting_id, patient_id")) return [[{ waiting_id: "3", organ_type_id: "4", status: "ACTIVE" }]];
    if (sql.startsWith("SELECT allocation_id")) return [state.allocated ? [{ allocation_id: "7" }] : []];
    if (sql.startsWith("SELECT organ_id FROM active_organ_reservation")) return [[]];
    if (sql.startsWith("INSERT INTO audit_log")) { state.writes.push("audit"); return [{}]; }
    if (sql.startsWith("INSERT INTO sync_outbox")) { state.writes.push("outbox"); return [{}]; }
    assert.fail(`Unexpected mocked query: ${sql}`);
  } };
  return { state, transaction: work => work(db) };
}
test("approval service accepts latest consistent evidence and writes only match/audit/outbox", async t => {
  const { state, transaction } = context(t);
  state.evidence = { overall_result: "COMPATIBLE", blood_group_result: "COMPATIBLE", hla_result: "COMPATIBLE" };
  const result = await createMatchingService(transaction).update("1", { match_status: "APPROVED" });
  assert.equal(result.match_status, "APPROVED");
  assert.deepEqual(state.writes, ["match", "audit", "outbox"]);
});
test("service blocks missing/latest-incompatible evidence and competing approvals without writes", async t => {
  const { state, transaction } = context(t), service = createMatchingService(transaction);
  for (const evidence of [null, { overall_result: "INCOMPATIBLE", blood_group_result: "INCOMPATIBLE", hla_result: "COMPATIBLE" }, { overall_result: "COMPATIBLE", blood_group_result: "COMPATIBLE", hla_result: "UNKNOWN" }]) {
    state.evidence = evidence;
    await assert.rejects(service.update("1", { match_status: "APPROVED" }), e => e.status === 409);
  }
  state.evidence = { overall_result: "COMPATIBLE", blood_group_result: "COMPATIBLE", hla_result: "COMPATIBLE" }; state.competing = true;
  await assert.rejects(service.update("1", { match_status: "APPROVED" }), e => e.status === 409);
  assert.deepEqual(state.writes, []);
});
test("approved cancellation cannot bypass active/completed allocation protection", async t => {
  const { state, transaction } = context(t, "APPROVED"), service = createMatchingService(transaction);
  state.allocated = true;
  await assert.rejects(service.update("1", { match_status: "CANCELLED" }), e => e.status === 409);
  assert.deepEqual(state.writes, []);
  state.allocated = false;
  assert.equal((await service.update("1", { match_status: "CANCELLED" })).match_status, "CANCELLED");
});
test("compatibility appends require a valid clinician reference and TESTING state", async t => {
  const { state, transaction } = context(t), service = createCompatibilityService(transaction);
  const input = { match_id: "1", performed_by: "5", blood_group_result: "UNKNOWN", hla_result: "UNKNOWN", overall_result: "INCONCLUSIVE" };
  await assert.rejects(service.create(input), e => e.code === "CLINICIAN_REQUIRED");
  state.clinicians = [{ user_id: "6" }];
  await assert.rejects(service.create(input), e => e.code === "INVALID_REFERENCE");
  state.clinicians = [{ user_id: "5" }];
  assert.equal((await service.create(input)).test_id, "9");
  assert.deepEqual(state.writes, ["test", "audit", "outbox"]);
  state.writes.length = 0; state.match.match_status = "APPROVED";
  await assert.rejects(service.create(input), e => e.status === 409);
  assert.deepEqual(state.writes, []);
});
