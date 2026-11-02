import { createRequire } from "node:module";
import { runProjectionJob } from "../src/lib/sync/projection-jobs.js";
import { closeMongoConnection } from "../src/lib/db/mongodb.js";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { safeSyncError } from "../src/lib/sync/documents.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
try { console.log(JSON.stringify(await runProjectionJob("backfill", { approveBackfill: process.argv.includes("--approve-backfill") }))); }
catch (error) { console.error(safeSyncError(error)); process.exitCode = 1; }
finally { await closeMongoConnection(); await getMysqlPool().end(); }
