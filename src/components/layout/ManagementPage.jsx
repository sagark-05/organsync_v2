"use client";

import Link from "next/link";
import ModuleNavigation from "./ModuleNavigation";
import { useEffect, useRef, useState } from "react";
import RecordForm, { labels } from "@/components/forms/RecordForm";
import RecordsTable from "@/components/tables/RecordsTable";
import { BLOOD_GROUPS, ORGAN_STATUSES } from "@/lib/validation/records";

async function api(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "The request failed. Please try again.");
  return body;
}
export default function ManagementPage({ entity }) {
  const plural = `${entity}s`, title = plural[0].toUpperCase() + plural.slice(1);
  const [references, setReferences] = useState({ centres: [], organTypes: [], developmentWritesEnabled: false });
  const [referenceError, setReferenceError] = useState("");
  const [result, setResult] = useState({ data: [], pagination: { page: 1, total: 0, totalPages: 0 } });
  const [query, setQuery] = useState({ search: "", centre_id: "", filter: "", page: 1 });
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [selection, setSelection] = useState(null);
  const dialog = useRef(null), panel = useRef(null);
  const canWrite = references.developmentWritesEnabled && token.length >= 32;
  const filterKey = entity === "organ" ? "organ_status" : "blood_group";

  useEffect(() => {
    const controller = new AbortController();
    api("/api/reference-data", { signal: controller.signal }).then(body => { setReferences(body.data); setReferenceError(""); }).catch(e => { if (!controller.signal.aborted) setReferenceError(e.message); });
    return () => controller.abort();
  }, [refresh]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(query.page), pageSize: "10", search: query.search });
    if (query.centre_id) params.set("centre_id", query.centre_id);
    if (query.filter) params.set(filterKey, query.filter);
    api(`/api/${plural}?${params}`, { signal: controller.signal }).then(body => {
      if (query.page > Math.max(1, body.pagination.totalPages)) { setQuery(previous => ({ ...previous, page: Math.max(1, body.pagination.totalPages) })); return; }
      setResult(body);
    }).catch(e => { if (!controller.signal.aborted) { setError(e.message); setResult({ data: [], pagination: { page: query.page, total: 0, totalPages: 0 } }); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [entity, plural, filterKey, query, refresh]);
  useEffect(() => {
    if (selection?.mode === "delete") dialog.current?.showModal();
    else if (selection) panel.current?.focus();
  }, [selection]);

  async function action(mode, record) {
    setBusy(true); setError(""); setMessage("");
    try { const body = await api(`/api/${plural}/${record[`${entity}_id`]}`); setSelection({ mode, record: body.data }); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function mutate(method, data) {
    if (method === "PATCH" && !Object.keys(data).length) { setMessage("No changes to save."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const recordId = selection?.record?.[`${entity}_id`];
      await api(`/api/${plural}${method === "POST" ? "" : `/${recordId}`}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, ...(method === "DELETE" ? {} : { body: JSON.stringify(data) }) });
      setMessage(method === "DELETE" ? "Record deleted." : method === "POST" ? "Record created." : "Record updated.");
      setSelection(null); setRefresh(value => value + 1);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  const filterValues = entity === "organ" ? ORGAN_STATUSES : BLOOD_GROUPS;
  return <div className="shell management">
    <header><Link className="brand" href="/"><span className="mark" aria-hidden="true">+</span>OrganSync <small>V2</small></Link><ModuleNavigation current={plural} /></header>
    <main>
      <div className="management-heading"><div><p className="eyebrow">REGISTRY MANAGEMENT</p><h1>{title}</h1><p>Manage fictional demonstration records. This educational system is not for clinical decisions.</p></div><button className="button" disabled={!canWrite || busy || loading} onClick={() => { setSelection({ mode: "create", record: null }); setError(""); setMessage(""); }}>Add {entity}</button></div>
      <aside className="write-notice"><strong>{references.developmentWritesEnabled ? "Local development writes enabled" : "Read-only mode"}</strong><p>Production authentication and role-based authorization are pending. {references.developmentWritesEnabled ? "Enter your development token to enable forms. It stays in this page’s memory." : "Writes require an explicit local development setting and a server-configured token."}</p>{references.developmentWritesEnabled && <label htmlFor="development-token">Development token<input id="development-token" type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} /></label>}</aside>
      {referenceError && <p className="feedback error" role="alert">Reference data: {referenceError}</p>}
      {error && selection?.mode !== "delete" && <p className="feedback error" role="alert">{error}</p>}
      {message && <p className="feedback success" role="status">{message}</p>}
      <form className="filters" onSubmit={event => { event.preventDefault(); setQuery(previous => ({ ...previous, search, page: 1 })); }}>
        <label htmlFor="search-records">Search<input id="search-records" type="search" maxLength={120} placeholder={entity === "organ" ? "Donor, organ type or centre" : "Name or centre"} value={search} onChange={e => setSearch(e.target.value)} /></label>
        <label htmlFor="filter-centre">Centre<select id="filter-centre" value={query.centre_id} onChange={e => setQuery(previous => ({ ...previous, centre_id: e.target.value, page: 1 }))}><option value="">All centres</option>{references.centres.map(row => <option key={row.centre_id} value={row.centre_id}>{row.centre_name}</option>)}</select></label>
        <label htmlFor="filter-records">{labels[filterKey]}<select id="filter-records" value={query.filter} onChange={e => setQuery(previous => ({ ...previous, filter: e.target.value, page: 1 }))}><option value="">All</option>{filterValues.map(value => <option key={value}>{value}</option>)}</select></label>
        <button type="submit" className="button">Search</button><button type="button" onClick={() => { setSearch(""); setQuery({ search: "", centre_id: "", filter: "", page: 1 }); }}>Clear</button><button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)}>Refresh</button>
      </form>
      <section aria-label={`${title} listing`} aria-busy={loading}>
        {loading ? <p role="status" className="empty">Loading {plural}…</p> : !error && !result.data.length ? <p className="empty">No records found. Try a different search or filter.</p> : result.data.length > 0 && <RecordsTable entity={entity} records={result.data} busy={busy} canWrite={canWrite} onAction={action} />}
        <div className="pagination"><span>{result.pagination.total} records · Page {query.page} of {Math.max(1, result.pagination.totalPages)}</span><div className="actions"><button disabled={loading || query.page <= 1} onClick={() => setQuery(previous => ({ ...previous, page: previous.page - 1 }))}>Previous</button><button disabled={loading || query.page >= result.pagination.totalPages} onClick={() => setQuery(previous => ({ ...previous, page: previous.page + 1 }))}>Next</button></div></div>
      </section>
      {selection && selection.mode !== "delete" && <section className="record-panel" ref={panel} tabIndex={-1} aria-labelledby="record-panel-heading"><h2 id="record-panel-heading">{selection.mode === "details" ? "Record details" : selection.mode === "create" ? `Add ${entity}` : `Edit ${entity}`}</h2>{selection.mode === "details" ? <><dl className="record-details">{Object.entries(selection.record).map(([key, value]) => <div key={key}><dt>{labels[key] || key}</dt><dd>{value === null ? "—" : String(value)}</dd></div>)}</dl><button onClick={() => setSelection(null)}>Close details</button></> : <RecordForm key={`${selection.mode}-${selection.record?.[`${entity}_id`] || "new"}`} entity={entity} record={selection.record} references={references} disabled={!canWrite} busy={busy} onSave={data => mutate(selection.mode === "create" ? "POST" : "PATCH", data)} onCancel={() => setSelection(null)} />}</section>}
      {selection?.mode === "delete" && <dialog ref={dialog} onCancel={event => { if (busy) event.preventDefault(); else setSelection(null); }} aria-labelledby="delete-heading"><h2 id="delete-heading">Delete this {entity}?</h2><p>{selection.record.full_name || `${selection.record.organ_name} from ${selection.record.donor_name}`} (#{selection.record[`${entity}_id`]})</p><p>Deletion is permanent. The server will reject deletion if dependent records exist.</p>{error && <p role="alert" className="feedback error">{error}</p>}<div className="actions"><button autoFocus disabled={busy} onClick={() => { setSelection(null); setError(""); }}>Cancel</button><button className="danger" disabled={busy || !canWrite} onClick={() => mutate("DELETE")}>{busy ? "Deleting…" : "Confirm deletion"}</button></div></dialog>}
    </main><footer><Link href="/">← Home</Link><span>OrganSync V2 · Fictional demonstration data only</span></footer>
  </div>;
}
