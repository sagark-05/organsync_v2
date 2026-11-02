import fs from "node:fs/promises";
const path = ".artifacts/sync-errors.jsonl";
export async function logSyncError(entry) {
  const safe = { at: new Date().toISOString(), event_id: entry.event_id || null, code: entry.code, outcome: entry.outcome };
  try { await fs.mkdir(".artifacts", { recursive: true }); await fs.appendFile(path, JSON.stringify(safe) + "\n"); } catch { /* FAILED outbox status remains durable even if local logging is unavailable. */ }
}
export async function recentSyncErrors() {
  let file;
  try {
    file = await fs.open(path, "r"); const stat = await file.stat(); const length = Math.min(stat.size, 65536), buffer = Buffer.alloc(length);
    await file.read(buffer, 0, length, stat.size - length);
    return buffer.toString("utf8").split("\n").filter(Boolean).slice(-20).flatMap(line => { try { const row = JSON.parse(line); return [{ at: row.at, event_id: row.event_id, code: row.code, outcome: row.outcome }]; } catch { return []; } });
  } catch { return []; } finally { if (file) await file.close(); }
}
