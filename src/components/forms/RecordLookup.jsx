"use client";
import { useEffect, useState } from "react";
import { requestJson } from "@/lib/api/client";

export default function RecordLookup({ endpoint, idKey, label, value, currentLabel, onChange, disabled }) {
  const [search, setSearch] = useState(""), [rows, setRows] = useState([]), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const body = await requestJson(`${endpoint}?${new URLSearchParams({ search, pageSize: "20" })}`, { signal: controller.signal }); setRows(body.data); setError(""); }
      catch (e) { if (!controller.signal.aborted) setError(e.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [endpoint, search]);
  return <div className="donor-picker"><label htmlFor={`lookup-search-${idKey}`}>Find {label.toLowerCase()}<input id={`lookup-search-${idKey}`} disabled={disabled} type="search" maxLength={120} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name" /></label><label htmlFor={`lookup-${idKey}`}>{label} *<select id={`lookup-${idKey}`} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} required><option value="">Select…</option>{value && !rows.some(row => String(row[idKey]) === String(value)) && <option value={value}>{currentLabel || "Selected record"} (#{value})</option>}{rows.map(row => <option key={row[idKey]} value={row[idKey]}>{row.full_name || row.patient_name} (#{row[idKey]})</option>)}</select></label><small>{loading ? "Loading…" : "Search narrows the first 20 results."}</small>{error && <p role="alert">{error}</p>}</div>;
}
