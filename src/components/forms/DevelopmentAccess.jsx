"use client";
import { useState } from "react";
import { requestJson } from "@/lib/api/client";
export default function DevelopmentAccess({ token, setToken, session, setSession, clinical = true }) {
  const [setup, setSetup] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [password, setPassword] = useState(""), [fictional, setFictional] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const body = await requestJson(`/api/development/${setup ? "clinician" : "clinician-session"}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password, ...(setup ? { full_name: name, confirm_fictional: fictional } : {}) }) });
      setPassword("");
      if (setup) { setMessage(body.data.message); setSetup(false); }
      else { setSession(body.data); setMessage("Signed in for this page. The session expires in one hour."); }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <aside className="write-notice"><strong>Local development authorization</strong><p>Production writes remain blocked. Credentials stay in page memory. Use fictional demonstration identities only.</p><label htmlFor="phase3e-dev-token">Development token<input id="phase3e-dev-token" type="password" autoComplete="off" value={token} onChange={e => { setToken(e.target.value); if (setSession) setSession(null); }} /></label>
    {clinical && <details><summary>Clinician sign-in and fictional account setup</summary>{session ? <p role="status">Signed in as {session.user.full_name}. <button type="button" onClick={() => setSession(null)}>Clear page session</button></p> : <><div className="actions"><button type="button" onClick={() => setSetup(false)} aria-pressed={!setup}>Sign in</button><button type="button" onClick={() => setSetup(true)} aria-pressed={setup}>Set up fictional clinician</button></div><form onSubmit={submit} className="record-form"><div className="form-grid">{setup && <label htmlFor="setup-clinician-name">Your chosen fictional clinician name<input id="setup-clinician-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>}<label htmlFor="setup-clinician-email">Fictional account email<input id="setup-clinician-email" type="email" required maxLength={254} autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} /></label><label htmlFor="setup-clinician-password">Password (12–128 characters)<input id="setup-clinician-password" type="password" required minLength={12} maxLength={128} autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} /></label></div>{setup && <label className="checkbox-label"><input type="checkbox" required checked={fictional} onChange={e => setFictional(e.target.checked)} />I explicitly authorize creating this fictional local development clinician account.</label>}<button className="button" disabled={busy || token.length < 32}>{busy ? "Working…" : setup ? "Create fictional account" : "Sign in"}</button></form></>}{error && <p className="feedback error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}</details>}
  </aside>;
}
