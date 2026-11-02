import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../src/lib/db/mongodb.js";
import { PROJECTIONS, projectionData, projectionHash, projectionId } from "../src/lib/sync/projection-schema.js";
import { projectionRepository } from "../src/lib/repositories/projection.repository.js";
import { projectionPreflight } from "../src/lib/sync/projection-jobs.js";
import { syncSource } from "../src/lib/sync/documents.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
try {
  await projectionPreflight(); const db = await getMongoDatabase(), pool = getMysqlPool(), source = syncSource(), collections = [];
  for (const [table, mapping] of Object.entries(PROJECTIONS)) {
    let after = "0", verified = 0;
    while (true) {
      const ids = await projectionRepository.ids(pool, table, after); if (!ids.length) break;
      for (const id of ids) {
        const expected = projectionData(table, await projectionRepository.read(pool, table, id)), actual = await db.collection(mapping.collection).findOne({ _id: projectionId(table, id) });
        assert.ok(actual); assert.equal(actual._sync.state, "ready"); assert.equal(actual._sync.deleted, false); assert.deepEqual(actual.data, expected); assert.equal(actual._sync.content_sha256, projectionHash(expected)); verified++; after = id;
      }
    }
    const active = await db.collection(mapping.collection).countDocuments({ source, "_sync.state": "ready", "_sync.deleted": false }); assert.equal(active, verified);
    collections.push({ table, collection: mapping.collection, verified, tombstones: await db.collection(mapping.collection).countDocuments({ source, "_sync.deleted": true }) });
  }
  const result = { executedAt: new Date().toISOString(), collections, activeTotal: collections.reduce((n, row) => n + row.verified, 0), allSourceRecordsMatched: true };
  await fs.writeFile(process.argv.includes("--backfill-evidence") ? ".artifacts/projection-backfill-evidence.json" : ".artifacts/projection-final-evidence.json", JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} catch { console.error("Projection verification failed; record contents and raw errors withheld."); process.exitCode = 1; }
finally { await closeMongoConnection(); await getMysqlPool().end(); }
