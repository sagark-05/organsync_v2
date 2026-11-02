import { getMysqlPool } from "../db/mysql.js";
import { syncRepository } from "../repositories/sync.repository.js";
import { createAtlasSink } from "./atlas-sink.js";
import { decimalId, safeSyncError } from "./documents.js";
import { logSyncError } from "./errors.js";
import { projectionEnabled } from "./projection-schema.js";
import { getProjector } from "./projections.js";

export function createSyncWorker({ pool = getMysqlPool(), sink = createAtlasSink(), repository = syncRepository, logger = logSyncError, retryBaseSeconds = 2, projector } = {}) {
  return {
    async runOnce({ eventId } = {}) {
      if (eventId !== undefined) eventId = decimalId(eventId);
      const db = await pool.getConnection(); let event, active = false;
      try {
        await db.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
        await db.beginTransaction(); active = true;
        event = await repository.claim(db, { eventId, retryBaseSeconds });
        if (!event) { await db.rollback(); active = false; return { outcome: "idle" }; }
        let confirmed;
        try {
          confirmed = await sink.persist(event, await repository.audits(db, event));
          if (projectionEnabled()) await (projector || getProjector()).refreshEvent(event, db);
        }
        catch (error) {
          const code = safeSyncError(error);
          await repository.failed(db, event.event_id); await db.commit(); active = false;
          await logger({ event_id: String(event.event_id), code, outcome: "failed" });
          return { outcome: "failed", event_id: String(event.event_id), attempt_count: event.attempt_count, code };
        }
        // Mongo has confirmed every required write. Only now can MySQL be acknowledged.
        await repository.delivered(db, event.event_id); await db.commit(); active = false;
        return { outcome: "delivered", event_id: String(event.event_id), attempt_count: event.attempt_count, ...confirmed };
      } catch (error) {
        if (active) await db.rollback().catch(() => {});
        await logger({ event_id: event ? String(event.event_id) : null, code: safeSyncError(error), outcome: "uncertain" });
        return { outcome: "uncertain", event_id: event ? String(event.event_id) : null, code: "MYSQL_OR_WORKER_UNCERTAIN" };
      } finally { db.release(); }
    },
    async runBatch(limit = 10) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("Worker batch size must be 1–20.");
      const results = [];
      for (let index = 0; index < limit; index++) { const result = await this.runOnce(); results.push(result); if (["idle", "uncertain"].includes(result.outcome)) break; }
      return results;
    },
  };
}
