"use client";
import { useEffect, useRef, useState } from "react";
import WorkflowForm from "@/components/forms/WorkflowForm";
import WorkflowTable from "@/components/tables/WorkflowTable";
import { requestJson } from "@/lib/api/client";
import { MATCH_STATUSES, MATCH_TRANSITIONS, WAITING_STATUSES } from "@/lib/validation/workflows";

const waitingColumns = [["waiting_id", "ID"], ["patient_name", "Patient"], ["organ_name", "Organ type"], ["centre_name", "Centre"], ["priority_level", "Priority"], ["status", "Status"]];
const matchColumns = [["match_id", "Match"], ["patient_name", "Patient"], ["organ_id", "Organ ID"], ["organ_name", "Organ type"], ["centre_name", "Patient centre"], ["match_status", "Status"], ["latest_overall_result", "Latest result"]];
const candidateColumns = [["waiting_id", "Registration"], ["patient_name", "Patient"], ["organ_id", "Organ ID"], ["organ_name", "Organ type"], ["donor_name", "Donor"], ["centre_name", "Patient centre"], ["organ_centre_name", "Organ centre"]];
const testColumns = [["test_id", "Test"], ["test_date", "Recorded at (UTC)"], ["performed_by_name", "Clinician reference"], ["blood_group_result", "Blood group"], ["hla_result", "HLA"], ["overall_result", "Overall"]];
const friendly = key => key.replaceAll("_", " ");
function Pagination({ pagination, page, loading, onPage }) {
  return <div className="pagination"><span>{pagination.total} records · Page {page} of {Math.max(1, pagination.totalPages)}</span><div className="actions"><button disabled={loading || page <= 1} onClick={() => onPage(page - 1)}>Previous</button><button disabled={loading || page >= pagination.totalPages} onClick={() => onPage(page + 1)}>Next</button></div></div>;
}
function Details({ record }) {
  return <dl className="record-details">{Object.entries(record).map(([key, value]) => <div key={key}><dt>{friendly(key)}</dt><dd>{value === null ? "—" : String(value)}</dd></div>)}</dl>;
}
export default function WorkflowPage({ kind }) {
  const isWaiting = kind === "waiting";
  const endpoint = isWaiting ? "/api/waiting-list" : "/api/matches";
  const [view, setView] = useState("matches");
  const [options, setOptions] = useState({ centres: [], organTypes: [], clinicians: [], developmentWritesEnabled: false });
  const [optionsError, setOptionsError] = useState("");
  const [token, setToken] = useState("");
  const [query, setQuery] = useState({ page: 1 });
  const [search, setSearch] = useState("");
  const [result, setResult] = useState({ data: [], pagination: { total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0), [selection, setSelection] = useState(null);
  const [history, setHistory] = useState({ data: [], pagination: { total: 0, totalPages: 0 } });
  const [historyPage, setHistoryPage] = useState(1), [historyLoading, setHistoryLoading] = useState(false), [historyError, setHistoryError] = useState("");
  const [testDetail, setTestDetail] = useState(null);
  const dialog = useRef(null), panel = useRef(null);
  const canWrite = options.developmentWritesEnabled && token.length >= 32;
  const confirm = selection && ["delete", "cancel-waiting", "propose"].includes(selection.mode);
  const selectedMatch = !isWaiting && selection?.mode === "details" ? selection.record.match_id : null;

  useEffect(() => {
    const controller = new AbortController();
    requestJson("/api/workflow-options", { signal: controller.signal }).then(body => { setOptions(body.data); setOptionsError(""); }).catch(e => { if (!controller.signal.aborted) setOptionsError(e.message); });
    return () => controller.abort();
  }, [refresh]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    const params = new URLSearchParams({ pageSize: "10" });
    for (const [key, value] of Object.entries(query)) if (value !== "" && !(view === "candidates" && key === "match_status")) params.set(key, String(value));
    requestJson(`${endpoint}${!isWaiting && view === "candidates" ? "/candidates" : ""}?${params}`, { signal: controller.signal }).then(body => {
      if (query.page > Math.max(1, body.pagination.totalPages)) { setQuery(previous => ({ ...previous, page: Math.max(1, body.pagination.totalPages) })); return; }
      setResult(body);
    }).catch(e => { if (!controller.signal.aborted) { setError(e.message); setResult({ data: [], pagination: { total: 0, totalPages: 0 } }); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [endpoint, isWaiting, query, refresh, view]);
  useEffect(() => {
    if (!selectedMatch) return;
    const controller = new AbortController(); setHistoryLoading(true); setHistoryError("");
    requestJson(`/api/compatibility-tests?${new URLSearchParams({ match_id: String(selectedMatch), page: String(historyPage), pageSize: "5" })}`, { signal: controller.signal }).then(body => setHistory(body)).catch(e => { if (!controller.signal.aborted) setHistoryError(e.message); }).finally(() => { if (!controller.signal.aborted) setHistoryLoading(false); });
    return () => controller.abort();
  }, [selectedMatch, historyPage, refresh]);
  useEffect(() => { if (confirm) dialog.current?.showModal(); else if (selection) panel.current?.focus(); }, [selection, confirm]);

  const filter = (key, value) => setQuery(previous => ({ ...previous, [key]: value, page: 1 }));
  async function select(mode, row) {
    setError(""); setMessage(""); setTestDetail(null); setHistoryPage(1);
    if (mode === "propose") { setSelection({ mode, record: row }); return; }
    setBusy(true);
    try { const body = await requestJson(`${endpoint}/${row[isWaiting ? "waiting_id" : "match_id"]}`); setSelection({ mode, record: body.data }); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function mutate(url, method, data) {
    if (method === "PATCH" && !Object.keys(data).length) { setMessage("No changes to save."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const body = await requestJson(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, ...(method === "DELETE" ? {} : { body: JSON.stringify(data) }) });
      if (!isWaiting && selection?.mode === "test") { const match = await requestJson(`/api/matches/${selection.record.match_id}`); setSelection({ mode: "details", record: match.data }); setHistoryPage(1); }
      else if (!isWaiting && selection?.mode === "status") setSelection({ mode: "details", record: body.data });
      else setSelection(null);
      setMessage(method === "DELETE" ? "Registration deleted." : "Saved successfully. No organ was reserved or allocated.");
      setRefresh(value => value + 1);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function showTest(record) {
    setBusy(true); setError("");
    try { setTestDetail((await requestJson(`/api/compatibility-tests/${record.test_id}`)).data); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  const choiceFilter = (key, label, choices) => <label htmlFor={`filter-${key}`} key={key}>{label}<select id={`filter-${key}`} value={query[key] || ""} onChange={e => filter(key, e.target.value)}><option value="">All</option>{choices.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
  const numberFilter = (key, label) => <label htmlFor={`filter-${key}`} key={key}>{label}<input id={`filter-${key}`} type="text" inputMode="numeric" pattern="[1-9][0-9]*" value={query[key] || ""} onChange={e => filter(key, e.target.value)} /></label>;
  return <div className="shell management workflow"><main id="main-content" tabIndex={-1}>
    <div className="management-heading"><div><p className="eyebrow">EDUCATIONAL WORKFLOW</p><h1>{isWaiting ? "Waiting list" : "Candidate matching"}</h1><p>{isWaiting ? "Manage fictional patient registrations and stored priorities." : "Organ-type and availability checks identify educational candidates only. No clinical scoring or medical suitability is inferred."}</p></div>{isWaiting && <button className="button" disabled={!canWrite || busy || loading} onClick={() => { setSelection({ mode: "waiting", record: null }); setError(""); setMessage(""); }}>Add registration</button>}</div>
    <aside className="write-notice"><strong>{options.developmentWritesEnabled ? "Local development writes enabled" : "Read-only mode"}</strong><p>Production authorization is pending. All records must be fictional. {options.developmentWritesEnabled ? "Enter the existing development token; it stays only in page memory." : "Writes require the existing explicit local development setting and server-configured token."}</p>{options.developmentWritesEnabled && <label htmlFor="workflow-token">Development token<input id="workflow-token" type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} /></label>}</aside>
    {!isWaiting && !optionsError && !options.clinicians.length && <p className="feedback" role="status">Compatibility entry is unavailable: an active clinician account is required. Existing history remains available.</p>}
    {optionsError && <p className="feedback error" role="alert">Reference data: {optionsError}</p>}{error && !confirm && <p className="feedback error" role="alert">{error}</p>}{message && <p className="feedback success" role="status">{message}</p>}
    {!isWaiting && <div className="actions workflow-tabs" role="group" aria-label="Matching view">{[["matches", "Recorded matches"], ["candidates", "Preview candidates"]].map(([value, label]) => <button key={value} aria-pressed={view === value} onClick={() => { setView(value); setQuery({ page: 1 }); setSearch(""); setSelection(null); setMessage(""); }}>{label}</button>)}</div>}
    {!isWaiting && view === "candidates" && <p className="note">Preview does not save records. Select a pair and confirm “Save proposed match” to record it. Existing pair history and approved conflicts are excluded. Stored priority determines display order only.</p>}
    <form className="filters" onSubmit={e => { e.preventDefault(); filter("search", search); }}>
      <label htmlFor="workflow-search">Search<input id="workflow-search" type="search" maxLength={120} placeholder={isWaiting ? "Patient name" : "Patient, donor or organ type"} value={search} onChange={e => setSearch(e.target.value)} /></label>
      {choiceFilter("organ_type_id", "Organ type", options.organTypes.map(row => [row.organ_type_id, row.organ_name]))}
      {choiceFilter("centre_id", isWaiting ? "Centre" : "Patient centre", options.centres.map(row => [row.centre_id, row.centre_name]))}
      {isWaiting ? <>{choiceFilter("priority_level", "Priority", [1, 2, 3, 4, 5].map(value => [value, String(value)]))}{choiceFilter("status", "Status", WAITING_STATUSES.map(value => [value, value]))}</> : <>{numberFilter("organ_id", "Organ ID")}{numberFilter("patient_id", "Patient ID")}{view === "matches" && choiceFilter("match_status", "Status", MATCH_STATUSES.map(value => [value, value]))}</>}
      <button className="button" type="submit">Search</button><button type="button" onClick={() => { setSearch(""); setQuery({ page: 1 }); }}>Clear</button><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)}>Refresh</button>
    </form>
    <section aria-label="Workflow records" aria-busy={loading}>{loading ? <p className="empty" role="status">Loading…</p> : !error && !result.data.length ? <p className="empty">No records found for these filters.</p> : result.data.length > 0 && <WorkflowTable rows={result.data} columns={isWaiting ? waitingColumns : view === "candidates" ? candidateColumns : matchColumns} caption={isWaiting ? "Waiting-list registrations" : view === "candidates" ? "Educational candidate preview" : "Recorded matches"} actions={row => !isWaiting && view === "candidates" ? <><button disabled={busy} onClick={() => { setSelection({ mode: "candidate-details", record: row }); setError(""); }}>Details</button><button disabled={!canWrite || busy} onClick={() => select("propose", row)}>Propose pair</button></> : <><button disabled={busy} onClick={() => select("details", row)}>Details</button>{isWaiting ? <><button disabled={!canWrite || busy || row.status !== "ACTIVE"} onClick={() => select("waiting", row)}>Edit</button><button disabled={!canWrite || busy || row.status !== "ACTIVE"} onClick={() => select("cancel-waiting", row)}>Cancel registration</button><button className="danger-text" disabled={!canWrite || busy || !["ACTIVE", "CANCELLED"].includes(row.status)} onClick={() => select("delete", row)}>Delete</button></> : <button disabled={!canWrite || busy || !MATCH_TRANSITIONS[row.match_status]?.length} onClick={() => select("status", row)}>Change status</button>}</>} />}
      <Pagination pagination={result.pagination} page={query.page} loading={loading} onPage={page => setQuery(previous => ({ ...previous, page }))} />
    </section>
    {selection && !confirm && <section className="record-panel" tabIndex={-1} ref={panel} aria-labelledby="workflow-panel-heading"><h2 id="workflow-panel-heading">{["details", "candidate-details"].includes(selection.mode) ? "Record details" : selection.mode === "waiting" ? selection.record ? "Edit registration" : "Add registration" : selection.mode === "status" ? "Change match status" : "Append fictional compatibility test"}</h2>
      {["details", "candidate-details"].includes(selection.mode) ? <><Details record={selection.record} />{!isWaiting && selection.mode === "details" && <section aria-labelledby="test-history-heading"><div className="section-heading"><h2 id="test-history-heading">Compatibility history</h2><button disabled={!canWrite || busy || !options.clinicians.length || selection.record.match_status !== "TESTING"} onClick={() => { setSelection({ mode: "test", record: selection.record }); setError(""); }}>Add fictional test</button></div>{historyError && <p className="feedback error" role="alert">{historyError}</p>}{historyLoading ? <p role="status">Loading history…</p> : !historyError && !history.data.length ? <p>No tests recorded. Approval is unavailable without compatible evidence.</p> : <WorkflowTable rows={history.data} columns={testColumns} caption="Compatibility test history" actions={row => <button disabled={busy} onClick={() => showTest(row)}>Test details</button>} />}<Pagination pagination={history.pagination} page={historyPage} loading={historyLoading} onPage={setHistoryPage} />{testDetail && <section className="test-detail" aria-label="Selected test details"><h3>Test #{testDetail.test_id}</h3><Details record={testDetail} /></section>}</section>}<button onClick={() => setSelection(null)}>Close details</button></> : <WorkflowForm key={`${selection.mode}-${selection.record?.waiting_id || selection.record?.match_id || "new"}`} mode={selection.mode} record={selection.record} options={options} disabled={!canWrite || (selection.mode === "test" && !options.clinicians.length)} busy={busy} onCancel={() => setSelection(null)} onSave={data => mutate(selection.mode === "test" ? "/api/compatibility-tests" : selection.mode === "status" ? `/api/matches/${selection.record.match_id}` : selection.record ? `/api/waiting-list/${selection.record.waiting_id}` : "/api/waiting-list", selection.mode === "test" || !selection.record ? "POST" : "PATCH", data)} />}
    </section>}
    {confirm && <dialog ref={dialog} onCancel={e => { if (busy) e.preventDefault(); else setSelection(null); }} aria-labelledby="workflow-confirm-heading"><h2 id="workflow-confirm-heading">{selection.mode === "propose" ? "Save proposed match?" : selection.mode === "delete" ? "Delete registration?" : "Cancel registration?"}</h2><p>{selection.record.patient_name} · {selection.record.organ_name}</p><p>{selection.mode === "propose" ? `Registration #${selection.record.waiting_id} and organ #${selection.record.organ_id}. This educational proposal does not establish medical suitability or allocate an organ.` : selection.mode === "delete" ? "The server will reject deletion if match history exists. Deletion is permanent." : "Only an unreferenced ACTIVE registration may be cancelled. This page cannot reactivate cancelled registrations."}</p>{error && <p className="feedback error" role="alert">{error}</p>}<div className="actions"><button autoFocus disabled={busy} onClick={() => { setSelection(null); setError(""); }}>Back</button><button className={selection.mode === "delete" ? "danger" : "button"} disabled={!canWrite || busy} onClick={() => selection.mode === "propose" ? mutate("/api/matches", "POST", { waiting_id: String(selection.record.waiting_id), organ_id: String(selection.record.organ_id) }) : mutate(`/api/waiting-list/${selection.record.waiting_id}`, selection.mode === "delete" ? "DELETE" : "PATCH", selection.mode === "delete" ? undefined : { status: "CANCELLED" })}>{busy ? "Saving…" : selection.mode === "propose" ? "Save proposed match" : "Confirm"}</button></div></dialog>}
  </main><footer><span>OrganSync V2 · Educational demonstration, not clinical decision-making</span></footer></div>;
}
