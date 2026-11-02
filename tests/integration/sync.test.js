import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { MongoClient } from "mongodb";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../../src/lib/db/mongodb.js";
import { recordMutation } from "../../src/lib/sync/outbox.js";
import { createSyncWorker } from "../../src/lib/sync/worker.js";
import { createAtlasSink } from "../../src/lib/sync/atlas-sink.js";
import { syncRepository } from "../../src/lib/repositories/sync.repository.js";
import { eventDocument } from "../../src/lib/sync/documents.js";
import { POST } from "../../src/lib/api/sync.js";
import { synchronizationStatus } from "../../src/lib/services/sync.service.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

test("Phase 3F real MySQL and Atlas durable outbox integration", { timeout: 180000 }, async t => {
  const pool = getMysqlPool(), atlas = await getMongoDatabase(), sink = createAtlasSink();
  const worker = (options = {}) => createSyncWorker({ ...options });
  const created = [];
  async function fixture() {
    const db = await pool.getConnection();
    try { await db.beginTransaction(); const id = String(randomBytes(6).readUIntBE(0, 6)); await recordMutation(db, "sync_demo", id, "CREATED"); const eventId = String((await db.query("SELECT LAST_INSERT_ID() id"))[0][0].id); await db.commit(); created.push(eventId); return eventId; }
    catch (e) { await db.rollback(); throw e; } finally { db.release(); }
  }
  const row = async id => (await pool.execute("SELECT * FROM sync_outbox WHERE event_id=?", [id]))[0][0];
  const retryNow = id => pool.execute("UPDATE sync_outbox SET processed_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY) WHERE event_id=? AND aggregate_type='sync_demo'", [id]);
  try {
    await atlas.command({ ping: 1 });
    await t.test("committed event and audit persist once; delivered replay is idle", async () => {
      const id = await fixture(); assert.equal((await worker().runOnce({ eventId: id })).outcome, "delivered");
      const source = await row(id), doc = eventDocument(source);
      assert.equal(source.status, "DELIVERED");
      assert.equal(await atlas.collection("sync_events").countDocuments({ _id: doc._id }), 1);
      await sink.persist(source, await syncRepository.audits(pool, source));
      assert.equal(await atlas.collection("sync_events").countDocuments({ _id: doc._id }), 1);
      assert.equal(await atlas.collection("audit_history").countDocuments({ entity_name: "sync_demo", entity_id: String(source.aggregate_id) }), 1);
      assert.equal((await worker().runOnce({ eventId: id })).outcome, "idle");
    });
    await t.test("uncommitted producer event is invisible to worker", async () => {
      const db = await pool.getConnection();
      try { await db.beginTransaction(); await recordMutation(db, "sync_demo", "123456789", "CREATED"); const id = String((await db.query("SELECT LAST_INSERT_ID() id"))[0][0].id); assert.equal((await worker().runOnce({ eventId: id })).outcome, "idle"); }
      finally { await db.rollback(); db.release(); }
    });
    await t.test("actual driver outage keeps committed business metadata and retries after recovery", async () => {
      const id = await fixture(), unavailable = new MongoClient("mongodb://127.0.0.1:1", { tls: true, serverSelectionTimeoutMS: 300, connectTimeoutMS: 300 });
      try {
        const outage = createAtlasSink(async () => { await unavailable.connect(); return unavailable.db("unreachable"); });
        const failed = await worker({ sink: outage }).runOnce({ eventId: id });
        assert.equal(failed.outcome, "failed"); assert.equal(failed.code, "ATLAS_UNAVAILABLE");
        const source = await row(id); assert.equal(source.status, "FAILED"); assert.equal(source.attempt_count, 1);
        assert.equal((await syncRepository.audits(pool, source)).length, 1); // Producer commit survived.
        assert.equal((await worker().runOnce({ eventId: id })).outcome, "idle"); // Backoff.
        await retryNow(id); assert.equal((await worker().runOnce({ eventId: id })).outcome, "delivered");
        assert.equal((await row(id)).attempt_count, 2);
      } finally { await unavailable.close(); }
    });
    await t.test("partial Atlas persistence replays without duplicate documents", async () => {
      const id = await fixture();
      const partial = { persist: async event => { await sink.persist(event, []); throw new Error("Injected after real event persistence, before audit"); } };
      assert.equal((await worker({ sink: partial }).runOnce({ eventId: id })).outcome, "failed");
      await retryNow(id); assert.equal((await worker().runOnce({ eventId: id })).outcome, "delivered");
      assert.equal(await atlas.collection("sync_events").countDocuments({ _id: eventDocument(await row(id))._id }), 1);
    });
    await t.test("concurrent workers skip a locked event without a second attempt", async () => {
      const id = await fixture(); let entered, release;
      const inside = new Promise(resolve => { entered = resolve; }), gate = new Promise(resolve => { release = resolve; });
      const first = worker({ sink: { persist: async (...args) => { entered(); await gate; return sink.persist(...args); } } }).runOnce({ eventId: id });
      await inside;
      try { assert.equal((await worker().runOnce({ eventId: id })).outcome, "idle"); } finally { release(); }
      assert.equal((await first).outcome, "delivered"); assert.equal((await row(id)).attempt_count, 1);
    });
    await t.test("crash after Atlas persistence releases row lock and replays safely", async () => {
      const id = await fixture(), db = await pool.getConnection();
      try { await db.beginTransaction(); const event = await syncRepository.claim(db, { eventId: id }); await sink.persist(event, await syncRepository.audits(db, event)); db.destroy(); }
      catch (e) { db.destroy(); throw e; }
      let recovered;
      for (let attempt = 0; attempt < 30; attempt++) {
        recovered = await worker().runOnce({ eventId: id });
        if (recovered.outcome !== "idle") break;
        await setTimeout(100);
      }
      assert.equal(recovered.outcome, "delivered");
      assert.equal(await atlas.collection("sync_events").countDocuments({ _id: eventDocument(await row(id))._id }), 1);
    });
    await t.test("stale committed PROCESSING event recovers", async () => {
      const id = await fixture(); await pool.execute("UPDATE sync_outbox SET status='PROCESSING' WHERE event_id=?", [id]);
      assert.equal((await worker().runOnce({ eventId: id })).outcome, "delivered");
    });
    await t.test("separate event locks permit concurrent successful workers", async () => {
      const ids = [await fixture(), await fixture()];
      const results = await Promise.all(ids.map(eventId => worker().runOnce({ eventId })));
      assert.ok(results.every(result => result.outcome === "delivered"));
    });
    await t.test("development API requires token, opt-in and explicit confirmation", async () => {
      const keys = ["NODE_ENV", "ORGANSYNC_DEV_WRITES", "ORGANSYNC_DEV_WRITE_TOKEN", "ORGANSYNC_DEV_SYNC"], old = keys.map(key => process.env[key]);
      const token = "fictional-phase3f-integration-token-123456789";
      Object.assign(process.env, { NODE_ENV: "development", ORGANSYNC_DEV_WRITES: "true", ORGANSYNC_DEV_WRITE_TOKEN: token, ORGANSYNC_DEV_SYNC: "true" });
      const request = (body, bearer = token) => new Request("http://localhost:3000/api/database-sync", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` }, body: JSON.stringify(body) });
      try {
        assert.equal((await POST(request({ action: "demo", confirm: true }, "wrong"))).status, 403);
        assert.equal((await POST(request({ action: "demo", confirm: false }))).status, 400);
        assert.equal((await POST(request({ action: "demo", confirm: true, sql: "arbitrary" }))).status, 400);
        const response = await POST(request({ action: "demo", confirm: true })); assert.equal(response.status, 200);
        const body = await response.json(); assert.equal(body.data.outcome, "delivered"); created.push(body.data.event_id);
      } finally { keys.forEach((key, i) => { if (old[i] === undefined) delete process.env[key]; else process.env[key] = old[i]; }); }
    });
    await t.test("dashboard exposes bounded sanitized Atlas audit history", async () => {
      const status = await synchronizationStatus();
      assert.equal(status.atlas.connected, true);
      assert.ok(status.atlas.recentAudits.length > 0 && status.atlas.recentAudits.length <= 20);
      for (const audit of status.atlas.recentAudits) assert.deepEqual(Object.keys(audit).sort(), ["action", "audit_id", "entity_id", "entity_name", "occurred_at"]);
    });
  } finally {
    // Retain fictional evidence; recover failed fixture events, never delete records.
    for (const id of created) if ((await row(id)).status !== "DELIVERED") { await retryNow(id); await worker().runOnce({ eventId: id }); }
    console.log(JSON.stringify({ phase3fEvidence: { eventIds: created, statuses: await Promise.all(created.map(async id => ({ event_id: id, status: (await row(id)).status }))) } }));
    await closeMongoConnection(); await pool.end();
  }
});
