import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = "http://localhost:3010", token = "phase3g-local-fictional-browser-test-token-20261102";
const identity = { full_name: "Fictional Phase3G Faculty Clinician", email: "phase3g-faculty-20261102@fictional.invalid", password: "Phase3G-Fictional-Only-2026!", confirm_fictional: true };
const evidence = [];
async function post(path, body, authorization) {
  return fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}) }, body: JSON.stringify(body) });
}
try {
  for (const path of ["donors", "patients", "organs", "waiting-list", "matches", "compatibility-tests", "allocations", "transplants", "follow-ups", "database-demo", "database-sync", "development/clinician-session"]) {
    const response = await post(`/api/${path}`, {}, undefined); assert.equal(response.status, 403);
    evidence.push({ endpoint: path, scenario: "no development token", status: response.status });
  }
  const noSession = await post("/api/allocations", { match_id: "1" }, token); assert.equal(noSession.status, 401);
  evidence.push({ endpoint: "allocations", scenario: "valid development token without clinician session", status: noSession.status });
  const foreignOrigin = await fetch(base + "/api/donors", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Origin: "http://untrusted.invalid" }, body: "{}" });
  assert.equal(foreignOrigin.status, 403); evidence.push({ endpoint: "donors", scenario: "foreign origin", status: 403 });
  if (process.argv.includes("--setup-fictional-clinician")) {
    const response = await post("/api/development/clinician", identity, token);
    assert.equal(response.status, 201); const body = await response.json();
    evidence.push({ endpoint: "development/clinician", scenario: "explicit fictional setup through existing guarded route", user_id: body.data.user_id, status: response.status });
  }
  await fs.mkdir(".artifacts", { recursive: true }); await fs.writeFile(".artifacts/phase3g-api-evidence.json", JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence));
} catch { console.error("Phase3G API verification failed; credentials and raw database errors withheld."); process.exitCode = 1; }
