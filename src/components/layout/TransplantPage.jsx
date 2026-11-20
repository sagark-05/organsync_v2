"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import DevelopmentAccess from "@/components/forms/DevelopmentAccess";
import WorkflowTable from "@/components/tables/WorkflowTable";
import { requestJson } from "@/lib/api/client";
import { OUTCOMES } from "@/lib/validation/transplants";

export default function TransplantPage() {
  const [tab, setTab] = useState("allocations"), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ data: [], pagination: { total: 0, totalPages: 0 } }), [loading, setLoading] = useState(true), [error, setError] = useState(""), [message, setMessage] = useState("");
  const [token, setToken] = useState(""), [session, setSession] = useState(null), [busy, setBusy] = useState(false), [detail, setDetail] = useState(null);
  const [form, setForm] = useState(null), [values, setValues] = useState({}), [centres, setCentres] = useState([]), [filter, setFilter] = useState("");
  const canWrite = token.length >= 32 && Boolean(session);
  useEffect(() => { const c = new AbortController(); requestJson("/api/reference-data", { signal: c.signal }).then(body => setCentres(body.data.centres)).catch(() => {}); return () => c.abort(); }, []);
  useEffect(() => {
    const c = new AbortController(); setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (filter) params.set(tab === "allocations" ? "allocation_status" : tab === "transplants" ? "outcome" : "transplant_id", filter);
    requestJson(`/api/${tab}?${params}`, { signal: c.signal }).then(body => { if (page > Math.max(1, body.pagination.totalPages)) setPage(Math.max(1, body.pagination.totalPages)); else setResult(body); }).catch(e => { if (!c.signal.aborted) { setError(e.message); setResult({ data: [], pagination: { total: 0, totalPages: 0 } }); } }).finally(() => { if (!c.signal.aborted) setLoading(false); });
    return () => c.abort();
  }, [tab, page, filter, refresh]);
  function open(kind, row) {
    setForm(kind); setError(""); setMessage("");
    setValues(kind === "allocation" ? { match_id: "" } : kind === "transplant" ? { allocation_id: row?.allocation_id || "", centre_id: "", performed_at: new Date().toISOString().slice(0, 19), outcome: "UNKNOWN", notes: "" } : { transplant_id: row?.transplant_id || "", follow_up_date: new Date().toISOString().slice(0, 10), patient_status: "", notes: "" });
  }
  async function write(url, data) {
    setBusy(true); setError(""); setMessage("");
    try { const body = await requestJson(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Clinician-Session": session?.session || "" }, body: JSON.stringify(data) }); setMessage(`Saved successfully.${body.data.execution ? ` Execution: ${body.data.execution === "stored_procedure" ? "MySQL stored procedure" : "MySQL transaction with application orchestration"}.` : ""}`); setForm(null); setDetail(body.data); setRefresh(value => value + 1); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function show(row) {
    setBusy(true); setError(""); try { const key = tab === "allocations" ? "allocation_id" : tab === "transplants" ? "transplant_id" : "follow_up_id"; setDetail((await requestJson(`/api/${tab}/${row[key]}`)).data); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const columns = tab === "allocations" ? [["allocation_id", "Allocation"], ["patient_name", "Patient"], ["organ_name", "Organ"], ["match_id", "Match"], ["allocation_status", "Status"], ["allocated_at", "Allocated (UTC)"]] : tab === "transplants" ? [["transplant_id", "Transplant"], ["patient_name", "Patient"], ["organ_name", "Organ"], ["centre_name", "Centre"], ["performed_at", "Performed (UTC)"], ["outcome", "Outcome"]] : [["follow_up_id", "Follow-up"], ["transplant_id", "Transplant"], ["follow_up_date", "Date"], ["patient_status", "Recorded status"], ["recorded_by_name", "Clinician"]];
  return <div className="shell management"><main id="main-content" tabIndex={-1}><div className="management-heading"><div><p className="eyebrow">ALLOCATION & CONTINUITY</p><h1>Transplants</h1><p>Allocation, transplant recording, and follow-up for fictional educational records.</p></div><Link className="button secondary" href="/database-demo">MySQL demonstrations</Link></div>
    <DevelopmentAccess token={token} setToken={setToken} session={session} setSession={setSession} />
    <p className="note">Allocation requires an APPROVED match and current compatible clinician evidence. Release and completion update related records atomically. Follow-up history is append-only.</p>
    <div className="actions workflow-tabs">{["allocations", "transplants", "follow-ups"].map(value => <button key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setPage(1); setFilter(""); setForm(null); setDetail(null); }}>{value.replace("-", " ")}</button>)}<button className="button" disabled={!canWrite || busy} onClick={() => open(tab === "allocations" ? "allocation" : tab === "transplants" ? "transplant" : "follow-up")}>Add {tab === "allocations" ? "allocation" : tab === "transplants" ? "transplant" : "follow-up"}</button></div>
    <div className="filters"><label htmlFor="phase3e-filter">{tab === "follow-ups" ? "Transplant ID" : "Filter status / outcome"}{tab === "follow-ups" ? <input id="phase3e-filter" inputMode="numeric" value={filter} onChange={e => { setPage(1); setFilter(e.target.value); }} /> : <select id="phase3e-filter" value={filter} onChange={e => { setPage(1); setFilter(e.target.value); }}><option value="">All</option>{(tab === "allocations" ? ["RESERVED", "RELEASED", "COMPLETED"] : OUTCOMES).map(value => <option key={value}>{value}</option>)}</select>}</label><button disabled={loading} onClick={() => setRefresh(value => value + 1)}>Refresh</button></div>
    {error && <p role="alert" className="feedback error">{error}</p>}{message && <p role="status" className="feedback success">{message}</p>}
    {loading ? <p role="status">Loading…</p> : error && !result.data.length ? null : !result.data.length ? <p className="empty">No records found.</p> : <WorkflowTable rows={result.data} columns={columns} caption={tab} actions={row => <><button onClick={() => show(row)} disabled={busy}>Details</button>{tab === "allocations" && row.allocation_status === "RESERVED" && <><button disabled={!canWrite || busy} onClick={() => open("transplant", row)}>Record transplant</button><button disabled={!canWrite || busy} onClick={() => { setForm("release"); setValues({ allocation_id: row.allocation_id }); }}>Release</button></>}{tab === "transplants" && <button disabled={!canWrite || busy} onClick={() => open("follow-up", row)}>Add follow-up</button>}</>} />}
    <div className="pagination"><span>{result.pagination.total} records · Page {page} of {Math.max(1, result.pagination.totalPages)}</span><div className="actions"><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><button disabled={page >= result.pagination.totalPages || loading} onClick={() => setPage(value => value + 1)}>Next</button></div></div>
    {form && <section className="record-panel"><h2>{form === "release" ? "Confirm allocation release" : `Add ${form}`}</h2>{form === "release" ? <><p>Release allocation #{values.allocation_id} and restore the eligible organ and registration statuses?</p><button disabled={!canWrite || busy} onClick={() => write(`/api/allocations/${values.allocation_id}/release`, {})}>Confirm release</button><button onClick={() => setForm(null)}>Cancel</button></> : <form className="record-form" onSubmit={e => { e.preventDefault(); write(`/api/${form === "allocation" ? "allocations" : form === "transplant" ? "transplants" : "follow-ups"}`, values); }}><div className="form-grid">{Object.entries(values).map(([key, value]) => <label key={key} htmlFor={`phase3e-${key}`}>{key.replaceAll("_", " ")}{key === "performed_at" ? " (UTC)" : ""}{key === "centre_id" || key === "outcome" ? <select id={`phase3e-${key}`} required value={value} onChange={e => setValues(previous => ({ ...previous, [key]: e.target.value }))}><option value="">Select…</option>{(key === "centre_id" ? centres.map(row => [row.centre_id, row.centre_name]) : OUTCOMES.map(value => [value, value])).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select> : key === "notes" ? <textarea id={`phase3e-${key}`} maxLength={16000} value={value} onChange={e => setValues(previous => ({ ...previous, [key]: e.target.value }))} /> : <input id={`phase3e-${key}`} required type={key === "performed_at" ? "datetime-local" : key === "follow_up_date" ? "date" : "text"} step={key === "performed_at" ? "1" : undefined} inputMode={key.endsWith("_id") ? "numeric" : undefined} value={value} maxLength={key === "patient_status" ? 60 : undefined} onChange={e => setValues(previous => ({ ...previous, [key]: e.target.value }))} />}</label>)}</div><p className="note">Use IDs from the matching and allocation lists. Clinician identity comes from the signed-in session.</p><div className="actions"><button className="button" disabled={!canWrite || busy}>{busy ? "Saving…" : "Save"}</button><button type="button" onClick={() => setForm(null)}>Cancel</button></div></form>}</section>}
    {detail && <section className="record-panel"><h2>Record details</h2><dl className="record-details">{Object.entries(detail).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{String(value ?? "—")}</dd></div>)}</dl><button onClick={() => setDetail(null)}>Close details</button></section>}
  </main><footer><span>Educational demonstration · No clinical decision-making</span></footer></div>;
}


