import { getMysqlPool } from "../db/mysql.js";

export const syncRepository = {
  async claim(db, { eventId, retryBaseSeconds = 2 } = {}) {
    const values = [retryBaseSeconds];
    const target = eventId ? " AND event_id = ?" : "";
    if (eventId) values.push(eventId);
    const [rows] = await db.execute(`SELECT event_id,aggregate_type,aggregate_id,event_type,payload,status,attempt_count,created_at,processed_at
      FROM sync_outbox WHERE (status IN ('PENDING','PROCESSING') OR (status='FAILED' AND
      (processed_at IS NULL OR TIMESTAMPDIFF(SECOND,processed_at,UTC_TIMESTAMP()) >= LEAST(300, ? * POW(2, LEAST(attempt_count,8))))))${target}
      ORDER BY event_id LIMIT 1 FOR UPDATE SKIP LOCKED`, values);
    if (!rows.length) return null;
    await db.execute("UPDATE sync_outbox SET status='PROCESSING',attempt_count=attempt_count+1 WHERE event_id=?", [rows[0].event_id]);
    return { ...rows[0], attempt_count: Number(rows[0].attempt_count) + 1 };
  },
  async audits(db, event) {
    // The schema has no audit↔event FK. Mirror independently identified history for
    // this entity; do not invent one-to-one correlations or copy actor identities.
    return (await db.execute("SELECT audit_id,entity_name,entity_id,action,occurred_at FROM audit_log WHERE entity_name=? AND entity_id=? ORDER BY audit_id", [event.aggregate_type, event.aggregate_id]))[0];
  },
  async delivered(db, eventId) { await db.execute("UPDATE sync_outbox SET status='DELIVERED',processed_at=UTC_TIMESTAMP() WHERE event_id=?", [eventId]); },
  async failed(db, eventId) { await db.execute("UPDATE sync_outbox SET status='FAILED',processed_at=UTC_TIMESTAMP() WHERE event_id=?", [eventId]); },
  async status(db = getMysqlPool()) {
    const [counts] = await db.query("SELECT status,COUNT(*) AS total FROM sync_outbox GROUP BY status");
    const [recent] = await db.query("SELECT event_id,aggregate_type,event_type,status,attempt_count,created_at,processed_at FROM sync_outbox ORDER BY event_id DESC LIMIT 20");
    const [failed] = await db.query("SELECT event_id,status,attempt_count,processed_at FROM sync_outbox WHERE status='FAILED' ORDER BY processed_at DESC,event_id DESC LIMIT 20");
    return { counts: Object.fromEntries(["PENDING", "PROCESSING", "DELIVERED", "FAILED"].map(status => [status, Number(counts.find(row => row.status === status)?.total || 0)])), recent, failed };
  },
};
