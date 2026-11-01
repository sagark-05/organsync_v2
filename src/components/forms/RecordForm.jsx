"use client";

import { useEffect, useState } from "react";
import { BLOOD_GROUPS, DONOR_TYPES, SEXES } from "@/lib/validation/records";

export const labels = {
  donor_id: "Donor ID", patient_id: "Patient ID", organ_id: "Organ ID", centre_id: "Transplant centre",
  full_name: "Full name", date_of_birth: "Date of birth", blood_group: "Blood group", donor_type: "Donor type",
  contact_phone: "Contact phone", sex: "Sex", city: "City", organ_type_id: "Organ type", organ_status: "Organ status",
  retrieved_at: "Retrieved at (UTC)", donor_name: "Donor", organ_name: "Organ type", centre_name: "Centre", registered_at: "Registered at", created_at: "Created at",
};
export function recordFields(entity) {
  return entity === "organ" ? ["donor_id", "organ_type_id", "centre_id", "retrieved_at"] : ["full_name", "centre_id", "date_of_birth", "blood_group", entity === "donor" ? "donor_type" : "sex", "contact_phone", ...(entity === "patient" ? ["city"] : [])];
}

function DonorPicker({ value, onChange, disabled, currentName }) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/donors?${new URLSearchParams({ search, pageSize: "20" })}`, { signal: controller.signal });
        const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Could not load donors.");
        setOptions(body.data); setError("");
      } catch (e) { if (!controller.signal.aborted) setError(e.message); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search]);
  return <div className="donor-picker"><label htmlFor="donor-search">Find a donor by name<input id="donor-search" value={search} disabled={disabled} onChange={e => setSearch(e.target.value)} placeholder="Search donors…" /></label><label htmlFor="record-donor_id">Donor<select id="record-donor_id" required disabled={disabled} value={value} onChange={e => onChange(e.target.value)}><option value="">Select a donor</option>{value && !options.some(row => String(row.donor_id) === String(value)) && <option value={value}>{currentName || "Selected donor"} (#{value})</option>}{options.map(row => <option key={row.donor_id} value={row.donor_id}>{row.full_name} (#{row.donor_id})</option>)}</select></label><small>Search narrows the first 20 results.</small>{error && <p role="alert">{error}</p>}</div>;
}

export default function RecordForm({ entity, record, references, disabled, busy, onSave, onCancel }) {
  const keys = recordFields(entity);
  const [values, setValues] = useState(() => Object.fromEntries(keys.map(key => [key, key === "retrieved_at" ? (record?.[key] || "").slice(0, 19) : record?.[key] ?? ""])));
  const set = (key, value) => setValues(previous => ({ ...previous, [key]: value }));
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(keys.map(key => [key, values[key] === "" && ["contact_phone", "city", "retrieved_at"].includes(key) ? null : values[key]]));
    // PATCH sends changed fields only, preserving untouched dates and references.
    if (record) {
      for (const key of keys) {
        const old = key === "retrieved_at" ? (record[key] || "").slice(0, 19) : record[key] ?? "";
        if (String(values[key]) === String(old)) delete data[key];
      }
    }
    onSave(data);
  }
  return <form className="record-form" onSubmit={submit}>
    <div className="form-grid">{keys.map(key => {
      if (key === "donor_id") return <DonorPicker key={key} value={values[key]} onChange={value => set(key, value)} disabled={disabled || busy} currentName={record?.donor_name} />;
      let options;
      if (key === "centre_id") options = references.centres.map(row => [row.centre_id, `${row.centre_name}${row.is_active ? "" : " (inactive)"}`]);
      if (key === "organ_type_id") options = references.organTypes.map(row => [row.organ_type_id, `${row.organ_name}${row.is_active ? "" : " (inactive)"}`]);
      if (key === "blood_group") options = BLOOD_GROUPS.map(value => [value, value]);
      if (key === "donor_type") options = DONOR_TYPES.map(value => [value, value]);
      if (key === "sex") options = SEXES.map(value => [value, value]);
      const optional = ["city", "contact_phone", "retrieved_at"].includes(key);
      return <label key={key} htmlFor={`record-${key}`}>{labels[key]}{optional ? " (optional)" : " *"}{options ? <select id={`record-${key}`} value={values[key]} required disabled={disabled || busy} onChange={e => set(key, e.target.value)}><option value="">Select…</option>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : <input id={`record-${key}`} type={key === "date_of_birth" ? "date" : key === "retrieved_at" ? "datetime-local" : key === "contact_phone" ? "tel" : "text"} step={key === "retrieved_at" ? "1" : undefined} min={key === "date_of_birth" ? "1900-01-01" : undefined} max={key === "date_of_birth" ? new Date().toISOString().slice(0, 10) : undefined} maxLength={key === "full_name" ? 120 : key === "city" ? 100 : key === "contact_phone" ? 20 : undefined} required={!optional} value={values[key]} disabled={disabled || busy} onChange={e => set(key, e.target.value)} />}</label>;
    })}</div>
    {entity === "organ" && <p className="note">New organs start as AVAILABLE. Status transitions belong to the matching, allocation, and transplant workflows. Times are entered in UTC.</p>}
    <div className="actions"><button type="submit" className="button" disabled={disabled || busy}>{busy ? "Saving…" : record ? "Save changes" : "Create record"}</button><button type="button" onClick={onCancel} disabled={busy}>Cancel</button></div>
  </form>;
}
