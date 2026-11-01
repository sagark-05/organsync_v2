import test from "node:test";
import assert from "node:assert/strict";
import { AppError, calendarDate, id, listOptions, validateRecord } from "../../src/lib/validation/records.js";
import { developmentWritesEnabled, requireDevelopmentWrite } from "../../src/lib/auth/development.js";
import { collectionHandlers, itemHandlers, readBody, respond } from "../../src/lib/api/records.js";
import { createRepository } from "../../src/lib/repositories/record.repository.js";
import { withTransaction } from "../../src/lib/services/record.service.js";

const donor = { centre_id: "1", full_name: "Fictional Unit Donor", date_of_birth: "1990-04-12", blood_group: "O+", donor_type: "LIVING" };
const organ = { donor_id: "1", centre_id: "1", organ_type_id: "1" };
const bad = fn => assert.throws(fn, e => e instanceof AppError && e.status === 400);
test("validates records and normalizes optional values without inventing fields", () => {
  assert.equal(validateRecord("donor", donor).contact_phone, null);
  const { donor_type, ...person } = donor;
  assert.equal(validateRecord("patient", { ...person, sex: "UNDISCLOSED" }).city, null);
});
test("rejects missing, unknown and wrongly typed fields", () => {
  for (const value of [null, [], {}, { ...donor, full_name: " " }, { ...donor, centre_id: 0 }, { ...donor, blood_group: "X+" }, { ...donor, donor_type: "OTHER" }, { ...donor, password: "secret" }]) bad(() => validateRecord("donor", value));
  bad(() => validateRecord("patient", { centre_id: 1, full_name: "Test", date_of_birth: "2000-01-01", blood_group: "A+", sex: "INVALID" }));
  assert.deepEqual(validateRecord("donor", { contact_phone: "" }, true), { contact_phone: null });
});
test("date validation rejects impossible, future and out-of-range dates", () => {
  for (const date of ["2025-02-29", "2024-02-30", "1899-01-01", "2999-01-01", "01/01/2000", "2000-1-01"]) bad(() => calendarDate(date));
  assert.equal(calendarDate("2000-02-29"), "2000-02-29");
  for (const value of ["2020-01-01T25:00:00Z", "2999-01-01T00:00", "2020-02-30T10:00", "2020-01-01"]) bad(() => validateRecord("organ", { ...organ, retrieved_at: value }));
  assert.equal(validateRecord("organ", { ...organ, retrieved_at: "2020-02-29T12:30" }).retrieved_at, "2020-02-29 12:30:00");
});
test("BIGINT IDs preserve precision and reject injection or unsafe numbers", () => {
  assert.equal(id("18446744073709551615"), "18446744073709551615");
  for (const value of ["18446744073709551616", "1 OR 1=1", "-1", "0", "01", 1.5, Number.MAX_SAFE_INTEGER + 1, null]) bad(() => id(value));
  bad(() => validateRecord("organ", { ...organ, organ_type_id: "65536" }));
});
test("organ CRUD cannot change workflow statuses", () => {
  assert.equal(validateRecord("organ", organ).organ_status, "AVAILABLE");
  for (const status of ["RESERVED", "TRANSPLANTED", "DISCARDED"]) assert.throws(() => validateRecord("organ", { ...organ, organ_status: status }), e => e.status === 409);
  assert.throws(() => validateRecord("organ", { organ_status: "AVAILABLE" }, true), e => e.status === 409);
});
test("pagination is bounded and filters validated", () => {
  assert.equal(listOptions("donor", {}).pageSize, 10);
  for (const query of [{ page: "0" }, { pageSize: "101" }, { page: "1.5" }, { sort: "DROP TABLE donor" }, { blood_group: "X+" }]) bad(() => listOptions("donor", query));
  assert.equal(listOptions("organ", { search: "%' OR 1=1 --", organ_status: "AVAILABLE" }).search, "%' OR 1=1 --");
});
test("all production writes and unconfigured development writes are denied", () => {
  const token = "fictional-test-token-12345678901234567890";
  const env = { NODE_ENV: "development", ORGANSYNC_DEV_WRITES: "true", ORGANSYNC_DEV_WRITE_TOKEN: token };
  const request = (url = "http://localhost:3000/api/donors", headers = {}) => new Request(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, ...headers } });
  assert.equal(developmentWritesEnabled(env), true);
  requireDevelopmentWrite(request(), env);
  for (const configuration of [{ ...env, NODE_ENV: "production" }, { ...env, ORGANSYNC_DEV_WRITES: "false" }, { ...env, ORGANSYNC_DEV_WRITE_TOKEN: "short" }]) assert.throws(() => requireDevelopmentWrite(request(), configuration), e => e.status === 403);
  assert.throws(() => requireDevelopmentWrite(request(undefined, { Authorization: "Bearer wrong" }), env), e => e.status === 403);
  assert.throws(() => requireDevelopmentWrite(request("http://example.com/api/donors"), env), e => e.status === 403);
  assert.throws(() => requireDevelopmentWrite(request(undefined, { Origin: "http://evil.example" }), env), e => e.status === 403);
});
test("API errors never return SQL, credentials or stack traces", async () => {
  const error = new Error("SQL secret password"); error.code = "ER_DUP_ENTRY";
  const response = await respond(() => { throw error; });
  assert.equal(response.status, 409);
  const text = await response.text(); assert.doesNotMatch(text, /secret|password|stack|SELECT/);
  assert.equal((await respond(() => { throw new Error("private"); })).status, 500);
});
test("route handlers await dynamic params and reject ambiguous queries", async () => {
  const route = itemHandlers({ get: async value => ({ donor_id: value }) });
  const response = await route.GET(new Request("http://localhost/api/donors/9"), { params: Promise.resolve({ id: "9" }) });
  assert.equal((await response.json()).data.donor_id, "9");
  const collection = collectionHandlers({ list: async query => ({ data: [], query }) });
  assert.equal((await collection.GET(new Request("http://localhost/api/donors?page=1&page=2"))).status, 400);
});
test("repositories bind hostile search values separately from SQL", async () => {
  const calls = [];
  const db = { execute: async (sql, values) => { calls.push({ sql, values }); return [[{ total: 0 }]]; }, query: async (sql, values) => { calls.push({ sql, values }); return [[]]; } };
  const search = "%' OR 1=1; DROP TABLE donor; --";
  await createRepository("organ").list(listOptions("organ", { search }), db);
  for (const call of calls) { assert.ok(!call.sql.includes(search)); assert.ok(call.values.includes(search)); assert.ok(!call.sql.includes("SELECT *")); }
});
test("request parsing rejects malformed, oversized and non-JSON bodies", async () => {
  for (const [body, contentType] of [["{", "application/json"], ["a".repeat(17000), "application/json"], ["{}", "text/plain"]]) {
    await assert.rejects(readBody(new Request("http://localhost/api/donors", { method: "POST", headers: { "Content-Type": contentType }, body })), e => e.status === 400);
  }
  assert.deepEqual(await readBody(new Request("http://localhost/api/donors", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })), {});
});
test("transaction commits atomically and rolls back failures before releasing", async () => {
  const original = globalThis.organSyncMysqlPool;
  const calls = [];
  globalThis.organSyncMysqlPool = { getConnection: async () => ({ beginTransaction: async () => calls.push("begin"), commit: async () => calls.push("commit"), rollback: async () => calls.push("rollback"), release: () => calls.push("release") }) };
  try {
    assert.equal(await withTransaction(async () => { calls.push("write"); return "ok"; }), "ok");
    assert.deepEqual(calls, ["begin", "write", "commit", "release"]);
    calls.length = 0;
    await assert.rejects(withTransaction(async () => { calls.push("write"); throw new Error("outbox failed"); }));
    assert.deepEqual(calls, ["begin", "write", "rollback", "release"]);
  } finally { if (original === undefined) delete globalThis.organSyncMysqlPool; else globalThis.organSyncMysqlPool = original; }
});
