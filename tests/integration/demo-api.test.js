import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks, createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getMysqlPool } from "../../src/lib/db/mysql.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());

test("database-demo API enforces explicit authorization and returns actual MySQL evidence", async () => {
  const hooks = registerHooks({ resolve(specifier, context, nextResolve) { return nextResolve(specifier.startsWith("@/") ? pathToFileURL(resolve("src", specifier.slice(2) + ".js")).href : specifier, context); } });
  const { POST, GET } = await import("../../src/app/api/database-demo/route.js");
  const keys = ["NODE_ENV", "ORGANSYNC_DEV_WRITES", "ORGANSYNC_DEV_WRITE_TOKEN", "ORGANSYNC_DEV_DB_DEMO"], beforeEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const token = "ephemeral-rollback-api-test-token-123456789012345";
  const request = (body, authorize = true) => new Request("http://localhost:3000/api/database-demo", { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(authorize ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const pool = getMysqlPool();
  const counts = async () => (await pool.query("SELECT (SELECT COUNT(*) FROM donor) donors,(SELECT COUNT(*) FROM patient) patients,(SELECT COUNT(*) FROM organ) organs,(SELECT COUNT(*) FROM app_user) users,(SELECT COUNT(*) FROM transplant) transplants"))[0][0];
  const original = await counts();
  try {
    Object.assign(process.env, { NODE_ENV: "development", ORGANSYNC_DEV_WRITES: "true", ORGANSYNC_DEV_WRITE_TOKEN: token, ORGANSYNC_DEV_DB_DEMO: "false" });
    const body = { scenario_id: "match-type-reject", confirm_rollback: true };
    assert.equal((await POST(request(body, false))).status, 403);
    assert.equal((await POST(request(body))).status, 403);
    const catalog = await GET(request()); assert.equal(catalog.status, 200);
    const catalogBody = await catalog.json(); assert.ok(catalogBody.data.triggers.length >= 10); assert.equal(catalogBody.data.scenarios.filter(row => !row.optional).every(row => row.installed), true);
    process.env.ORGANSYNC_DEV_DB_DEMO = "true";
    assert.equal((await POST(request({ ...body, confirm_rollback: false }))).status, 400);
    assert.equal((await POST(request({ ...body, sql: "DROP DATABASE organsync_v2" }))).status, 400);
    const response = await POST(request(body)); assert.equal(response.status, 200);
    const result = (await response.json()).data;
    assert.equal(result.actualObject, "trg_match_validate_insert"); assert.equal(result.mysql.errno, 1644); assert.equal(result.mysql.sqlState, "45000"); assert.equal(result.rollback.fixtureAbsenceVerified, true);
    assert.deepEqual(result.before, result.after);
    process.env.NODE_ENV = "production"; assert.equal((await POST(request(body))).status, 403); assert.equal((await GET(request())).status, 403);
    assert.deepEqual(await counts(), original);
  } finally { for (const key of keys) { if (beforeEnv[key] === undefined) delete process.env[key]; else process.env[key] = beforeEnv[key]; } hooks.deregister(); await pool.end(); }
});
