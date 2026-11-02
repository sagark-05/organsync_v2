import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { runProjectionJob } from "../src/lib/sync/projection-jobs.js";
import { closeMongoConnection } from "../src/lib/db/mongodb.js";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { safeSyncError } from "../src/lib/sync/documents.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
let running = true; process.on("SIGINT", () => { running = false; }); process.on("SIGTERM", () => { running = false; });
try {
  do {
    try { console.log(JSON.stringify(await runProjectionJob("reconcile"))); }
    catch (error) { console.error(safeSyncError(error)); if (!process.argv.includes("--watch")) process.exitCode = 1; }
    if (process.argv.includes("--watch") && running) await setTimeout(60000);
  } while (process.argv.includes("--watch") && running);
} finally { await closeMongoConnection(); await getMysqlPool().end(); }
