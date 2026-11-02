"use client";
import { useState } from "react";
import RecordLookup from "./RecordLookup";
import { COMPONENT_RESULTS, MATCH_TRANSITIONS, OVERALL_RESULTS } from "@/lib/validation/workflows";

export default function WorkflowForm({ mode, record, options, disabled, busy, onSave, onCancel }) {
  const waiting = mode === "waiting";
  const initial = waiting ? { patient_id: record?.patient_id ?? "", organ_type_id: record?.organ_type_id ?? "", centre_id: record?.centre_id ?? "", priority_level: record?.priority_level ?? "3" } : mode === "status" ? { match_status: "" } : { match_id: String(record.match_id), performed_by: "", blood_group_result: "UNKNOWN", hla_result: "UNKNOWN", overall_result: "INCONCLUSIVE", remarks: "" };
  const [values, setValues] = useState(initial);
  const set = (key, value) => setValues(previous => ({ ...previous, [key]: value }));
  const select = (key, label, choices) => <label key={key} htmlFor={`workflow-${key}`}>{label} *<select id={`workflow-${key}`} value={values[key]} disabled={disabled || busy} required onChange={e => set(key, e.target.value)}><option value="">Select…</option>{choices.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
  function submit(event) {
    event.preventDefault(); const data = { ...values };
    if (waiting && record) for (const key of Object.keys(data)) if (String(data[key]) === String(record[key])) delete data[key];
    if (mode === "test" && !data.remarks) data.remarks = null;
    onSave(data);
  }
  return <form className="record-form" onSubmit={submit}><div className="form-grid">{waiting ? <>
    <RecordLookup endpoint="/api/patients" idKey="patient_id" label="Patient" value={values.patient_id} currentLabel={record?.patient_name} onChange={value => set("patient_id", value)} disabled={disabled || busy} />
    {select("organ_type_id", "Organ type", options.organTypes.map(row => [row.organ_type_id, row.organ_name]))}
    {select("centre_id", "Centre", options.centres.map(row => [row.centre_id, row.centre_name]))}
    {select("priority_level", "Priority level (stored administrative value)", [1, 2, 3, 4, 5].map(value => [value, String(value)]))}
  </> : mode === "status" ? select("match_status", "Next match status", (MATCH_TRANSITIONS[record.match_status] || []).map(value => [value, value])) : <>
    {select("performed_by", "Existing active clinician", options.clinicians.map(row => [row.user_id, `${row.full_name} (#${row.user_id})`]))}
    {select("blood_group_result", "Blood-group result", COMPONENT_RESULTS.map(value => [value, value]))}
    {select("hla_result", "HLA result", COMPONENT_RESULTS.map(value => [value, value]))}
    {select("overall_result", "Overall result", OVERALL_RESULTS.map(value => [value, value]))}
    <label htmlFor="workflow-remarks">Fictional assessment remarks (optional)<textarea id="workflow-remarks" value={values.remarks} maxLength={16000} disabled={disabled || busy} onChange={e => set("remarks", e.target.value)} /></label>
  </>}</div>
    <p className="note">{waiting ? "New registrations start ACTIVE. Referenced registrations cannot be changed here." : mode === "status" ? "Approval requires the latest compatible test evidence and no competing approval. This does not allocate or reserve an organ." : "Append-only fictional educational evidence. The server records the test timestamp. Selecting a clinician reference does not authenticate that person."}</p>
    <div className="actions"><button className="button" type="submit" disabled={disabled || busy}>{busy ? "Saving…" : "Save"}</button><button type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </form>;
}
