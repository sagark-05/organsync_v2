import test from "node:test";
import assert from "node:assert/strict";
import { eventDocument, auditDocument, safeSyncError } from "../../src/lib/sync/documents.js";
import { createAtlasSink } from "../../src/lib/sync/atlas-sink.js";
import { createSyncWorker } from "../../src/lib/sync/worker.js";
import { POST } from "../../src/lib/api/sync.js";
const event = { event_id: "123", aggregate_type: "donor", aggregate_id: "5", event_type: "DONOR_UPDATED", payload: { donor_id: 5, action: "UPDATED", password: "secret", full_name: "Private" }, created_at: "2026-11-02 00:00:00", attempt_count: 1 };

test("sync payload allowlist drops PII, credentials and actor identity", () => {
  const doc = eventDocument(event, "test");
  assert.deepEqual(doc.payload, { donor_id: "5", action: "UPDATED" });
  assert.equal(JSON.stringify(doc).includes("secret"), false);
  assert.equal(auditDocument({ entity_name: "app_user" }), null);
  const auth = eventDocument({ ...event, aggregate_type: "app_session" });
  assert.equal(auth.redacted, true); assert.deepEqual(auth.payload, {}); assert.equal(auth.aggregate_id, undefined);
});
test("stable BIGINT event IDs and deterministic immutable content", () => {
  assert.deepEqual(eventDocument(event), eventDocument(event));
  assert.ok(eventDocument({ ...event, event_id: "18446744073709551615" })._id.endsWith("18446744073709551615"));
  assert.throws(() => eventDocument({ ...event, event_id: "18446744073709551616" }));
  assert.throws(() => eventDocument({ ...event, event_id: Number.MAX_SAFE_INTEGER + 1 }));
  assert.equal(eventDocument({ ...event, aggregate_type: "constructor" }).redacted, true);
});
test("sanitized errors cannot expose raw Atlas messages or URI", () => {
  assert.equal(safeSyncError({ name: "MongoNetworkError", message: "secret-uri" }), "ATLAS_UNAVAILABLE");
  assert.equal(safeSyncError({ message: "secret-uri" }), "SYNC_OPERATION_FAILED");
  assert.equal(safeSyncError({ code: 18 }), "ATLAS_AUTHENTICATION");
});
function fakeMongo() {
  const documents = new Map();
  return { documents, listCollections: () => ({ toArray: async () => [{ type: "collection" }] }), collection: name => ({
    updateOne: async (filter, update) => { const key = name + filter._id; if (!documents.has(key)) documents.set(key, structuredClone(update.$setOnInsert)); return { acknowledged: true }; },
    findOne: async filter => documents.get(name + filter._id),
  }) };
}
test("idempotent upserts preserve a single existing event and reject immutable collisions", async () => {
  const db = fakeMongo(), sink = createAtlasSink(async () => db, "test");
  await sink.persist(event, []); await sink.persist(event, []); assert.equal(db.documents.size, 1);
  const original = structuredClone([...db.documents.values()][0]);
  await assert.rejects(sink.persist({ ...event, event_type: "DIFFERENT" }, []), e => e.syncCode === "IMMUTABLE_DOCUMENT_CONFLICT");
  assert.deepEqual([...db.documents.values()][0], original);
  [...db.documents.values()][0].payload = { donor_id: "999" };
  await assert.rejects(sink.persist(event, []), e => e.syncCode === "IMMUTABLE_DOCUMENT_CONFLICT");
});
test("unacknowledged Mongo write is never accepted", async () => {
  const db = fakeMongo(); db.collection = () => ({ updateOne: async () => ({ acknowledged: false }) });
  await assert.rejects(createAtlasSink(async () => db).persist(event, []), e => e.syncCode === "WRITE_NOT_ACKNOWLEDGED");
});
function workerFixture(fail = false) {
  const calls = [];
  const db = { query: async () => {}, beginTransaction: async () => calls.push("begin"), commit: async () => calls.push("commit"), rollback: async () => calls.push("rollback"), release: () => calls.push("release") };
  const repository = { claim: async () => event, audits: async () => [], delivered: async () => calls.push("delivered"), failed: async () => calls.push("failed") };
  const worker = createSyncWorker({ pool: { getConnection: async () => db }, repository, projector: { refreshEvent: async () => [] }, sink: { persist: async () => { calls.push("mongo"); if (fail) throw { name: "MongoNetworkError" }; return {}; } }, logger: async () => {} });
  return { calls, worker, db };
}
test("worker acknowledges MySQL only after Mongo confirmation", async () => {
  const { worker, calls } = workerFixture(); assert.equal((await worker.runOnce()).outcome, "delivered");
  assert.deepEqual(calls, ["begin", "mongo", "delivered", "commit", "release"]);
});
test("outage commits retryable FAILED state without delivery acknowledgement", async () => {
  const { worker, calls } = workerFixture(true); assert.equal((await worker.runOnce()).code, "ATLAS_UNAVAILABLE");
  assert.deepEqual(calls, ["begin", "mongo", "failed", "commit", "release"]);
});
test("ambiguous SQL commit rolls back and reports uncertain for safe replay", async () => {
  const { worker, db, calls } = workerFixture(); db.commit = async () => { throw new Error("connection lost"); };
  assert.equal((await worker.runOnce()).outcome, "uncertain"); assert.ok(calls.includes("rollback"));
});
test("production sync writes are blocked before touching a database", async () => {
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = "production";
  try { assert.equal((await POST(new Request("http://localhost/api/database-sync", { method: "POST" }))).status, 403); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
