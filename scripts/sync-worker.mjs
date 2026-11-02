import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { createSyncWorker } from "../src/lib/sync/worker.js";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { closeMongoConnection } from "../src/lib/db/mongodb.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
if (process.env.ORGANSYNC_SYNC_WORKER_ENABLED !== "true") { console.error("Worker disabled. Explicitly configure ORGANSYNC_SYNC_WORKER_ENABLED=true."); process.exitCode = 1; }
else {
  let running = true; process.on("SIGINT", () => { running = false; }); process.on("SIGTERM", () => { running = false; });
  try { const worker = createSyncWorker(); do { console.log(JSON.stringify(await worker.runBatch(10))); if (!process.argv.includes("--once") && running) await setTimeout(2000); } while (running && !process.argv.includes("--once")); }
  catch { console.error("Synchronization worker stopped; inspect sanitized synchronization status."); process.exitCode = 1; }
  finally { await closeMongoConnection(); await getMysqlPool().end(); }
}
