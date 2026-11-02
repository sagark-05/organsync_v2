import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { allocationInput, followUpInput, phase3eOptions, transplantInput } from "../../src/lib/validation/transplants.js";
import { credentials, requireClinicianSession } from "../../src/lib/auth/clinician.js";
import { clinicalCollection, releaseHandler } from "../../src/lib/api/phase3e.js";
import { runDatabaseDemo } from "../../src/lib/services/database-demo.service.js";
import { DEMO_SCENARIOS } from "../../src/lib/database-demo/catalog.js";
import { requireTransactionSafeDefinition } from "../../src/lib/repositories/allocation.repository.js";

test("Phase 3E payloads validate IDs, outcomes, times and append-only actor fields", () => {
  assert.deepEqual(allocationInput({ match_id: "1" }), { match_id: "1" });
  assert.throws(() => allocationInput({ match_id: "1", organ_id: "2" }), e => e.status === 400);
  const input = { allocation_id: "1", centre_id: "1", performed_at: "2020-01-01T12:00:00Z", outcome: "UNKNOWN" };
  assert.equal(transplantInput(input).performed_at, "2020-01-01 12:00:00");
  for (const data of [{ ...input, outcome: "CURED" }, { ...input, performed_at: "2999-01-01T00:00:00Z" }, { ...input, performed_at: "2020-02-30T10:00:00Z" }, { ...input, performed_at: "2020-01-01T25:00:00Z" }]) assert.throws(() => transplantInput(data), e => e.status === 400);
  assert.throws(() => followUpInput({ transplant_id: "1", follow_up_date: "2020-01-01", patient_status: "Demo", recorded_by: "1" }), e => e.status === 400);
  assert.equal(followUpInput({ transplant_id: "1", follow_up_date: "2020-01-01", patient_status: "Fictional stable" }).notes, null);
  assert.throws(() => phase3eOptions("allocations", { allocation_status: "AVAILABLE" }), e => e.status === 400);
});
test("clinician setup requires explicit fictional identity and strong password input", () => {
  const input = { full_name: "Fictional Unit Clinician", email: "fictional@example.invalid", password: "Unit-test-password-1234", confirm_fictional: true };
  assert.equal(credentials(input, true).full_name, input.full_name);
  for (const data of [{ ...input, confirm_fictional: false }, { ...input, full_name: "" }, { ...input, password: "short" }, { ...input, email: "invalid" }, { ...input, role: "ADMIN" }]) assert.throws(() => credentials(data, true), e => e.status === 400);
});
test("clinical endpoints require the development guard before any database authentication", async () => {
  const old = process.env.ORGANSYNC_DEV_WRITES; process.env.ORGANSYNC_DEV_WRITES = "false";
  try {
    const service = { create: () => assert.fail("unexpected write"), release: () => assert.fail("unexpected release") };
    const response = await clinicalCollection(service, () => assert.fail("unexpected authentication query")).POST(new Request("http://localhost/api/allocations", { method: "POST" }));
    assert.equal(response.status, 403);
    assert.equal((await releaseHandler(service)(new Request("http://localhost/api/allocations/1/release", { method: "POST" }), { params: Promise.resolve({ id: "1" }) })).status, 403);
  } finally { if (old === undefined) delete process.env.ORGANSYNC_DEV_WRITES; else process.env.ORGANSYNC_DEV_WRITES = old; }
});
test("absent or malformed clinician sessions fail before SQL", async () => {
  await assert.rejects(requireClinicianSession(new Request("http://localhost"), { execute: () => assert.fail("SQL must not run") }), e => e.status === 401);
});
test("demo accepts fixed scenario IDs only and covers each live trigger with an explicit rejection", async () => {
  assert.equal(new Set(DEMO_SCENARIOS.filter(row => !row.optional && row.enforcement === "trigger" && row.expected === "rejected").map(row => row.object)).size, 10);
  for (const id of ["SELECT 1", "DROP TABLE donor", "unknown", null]) await assert.rejects(runDatabaseDemo(id, { getConnection: () => assert.fail("Arbitrary SQL reached database") }), e => e.status === 400);
  assert.equal(DEMO_SCENARIOS.filter(row => !row.optional && row.expected === "accepted" && row.enforcement !== "procedure").length, 8);
});
test("proposed migration is additive and transaction-safe by static inspection only", () => {
  const sql = fs.readFileSync("database/migrations/007_phase3e_integrity_proposal.sql", "utf8");
  assert.equal((sql.match(/CREATE PROCEDURE sp_\w+_tx\(/g) || []).length, 3);
  assert.doesNotMatch(sql, /\bDROP\s+(TABLE|DATABASE|PROCEDURE|TRIGGER)|\bTRUNCATE\b|\bSTART TRANSACTION\s*;|\bCOMMIT\s*;/i);
  assert.equal((sql.match(/INSERT INTO audit_log/g) || []).length, 3);
  assert.equal((sql.match(/INSERT INTO sync_outbox/g) || []).length, 3);
  assert.match(sql, /trg_match_transition_guard/);
  assert.match(sql, /uq_approved_organ/);
});
test("008 repair has four correct delimiter blocks and never replaces existing objects", () => {
  const sql = fs.readFileSync("database/migrations/008_phase3e_reconciliation_proposal.sql", "utf8");
  assert.equal((sql.match(/CREATE TRIGGER/g) || []).length, 4);
  assert.equal((sql.match(/END\$\$/g) || []).length, 4);
  assert.doesNotMatch(sql.replace(/--[^\n]*/g, ""), /END\$(?!\$)/);
  assert.doesNotMatch(sql, /\bDROP\s+(TRIGGER|PROCEDURE|TABLE|DATABASE)\b/);
});
test("installed routines with transaction control or missing atomic audit are refused", () => {
  const body = "BEGIN RELEASE SAVEPOINT organsync_phase3e_call; INSERT INTO audit_log VALUES (1); INSERT INTO sync_outbox VALUES (1); END";
  requireTransactionSafeDefinition(body);
  for (const value of [null, "BEGIN COMMIT; END", body.replace("INSERT INTO audit_log", "INSERT INTO other_table"), body.replace("END", "COMMIT; END"), body.replace("END", "CALL unsafe(); END")]) assert.throws(() => requireTransactionSafeDefinition(value), e => e.code === "PROCEDURE_REVIEW_REQUIRED");
});
