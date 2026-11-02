import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
import { DEMO_SCENARIOS } from "../../src/lib/database-demo/catalog.js";
import { runDatabaseDemo } from "../../src/lib/services/database-demo.service.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
let pool, original, installed;
const evidence = [];
const counts = async () => (await pool.query("SELECT (SELECT COUNT(*) FROM donor) donors,(SELECT COUNT(*) FROM patient) patients,(SELECT COUNT(*) FROM organ) organs,(SELECT COUNT(*) FROM app_user) users,(SELECT COUNT(*) FROM transplant) transplants,(SELECT COUNT(*) FROM organ_allocation) allocations,(SELECT COUNT(*) FROM audit_log) audits,(SELECT COUNT(*) FROM sync_outbox) events"))[0][0];
before(async () => { pool = getMysqlPool(); original = await counts(); const [triggers] = await pool.query("SELECT TRIGGER_NAME AS name FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE()"); const [routines] = await pool.query("SELECT ROUTINE_NAME AS name FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_TYPE='PROCEDURE'"); installed = new Set([...triggers, ...routines].map(row => row.name)); });
after(async () => { try { if (pool) { assert.deepEqual(await counts(), original); fs.mkdirSync('.artifacts', { recursive: true }); fs.writeFileSync('.artifacts/phase3e-trigger-results.json', JSON.stringify(evidence, null, 2)); } } finally { if (pool) await pool.end(); } });
for (const scenario of DEMO_SCENARIOS) {
  test(`actual MySQL ${scenario.object}: ${scenario.id}`, async t => {
    if (scenario.optional && !installed.has(scenario.object)) { t.skip("Optional database object is not installed; no result simulated."); return; }
    const result = await runDatabaseDemo(scenario.id, pool);
    evidence.push(result);
    assert.equal(result.reachedDatabase, true);
    assert.equal(result.validationIntercepted, false);
    assert.equal(result.actual, scenario.expected, JSON.stringify(result.mysql));
    assert.equal(result.actualObject, scenario.object, JSON.stringify(result.mysql));
    assert.equal(result.passed, true);
    assert.equal(result.rollback.fixtureAbsenceVerified, true);
    if (scenario.expected === "rejected") {
      assert.deepEqual(result.after, result.before);
      if (scenario.enforcement === "trigger") { assert.equal(result.mysql.errno, 1644); assert.equal(result.mysql.sqlState, "45000"); assert.equal(result.mysql.message, scenario.message); assert.match(result.triggerDefinitionSha256, /^[a-f0-9]{64}$/); }
    } else assert.notDeepEqual(result.after, result.before);
    assert.deepEqual(await counts(), original);
  });
}
