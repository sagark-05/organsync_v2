"use client";
import { labels } from "@/components/forms/RecordForm";

export default function RecordsTable({ entity, records, busy, canWrite, onAction }) {
  const keys = entity === "organ" ? ["organ_id", "organ_name", "donor_name", "centre_name", "organ_status"] : [`${entity}_id`, "full_name", "blood_group", entity === "donor" ? "donor_type" : "sex", "centre_name"];
  return <div className="table-scroll"><table><caption className="sr-only">{entity} records</caption><thead><tr>{keys.map(key => <th scope="col" key={key}>{labels[key]}</th>)}<th scope="col">Actions</th></tr></thead><tbody>{records.map(record => {
    const editable = entity !== "organ" || record.organ_status === "AVAILABLE";
    return <tr key={record[`${entity}_id`]}>{keys.map(key => <td key={key}>{record[key] ?? "—"}</td>)}<td><div className="row-actions"><button disabled={busy} onClick={() => onAction("details", record)}>Details</button><button disabled={busy || !canWrite || !editable} onClick={() => onAction("edit", record)}>Edit</button><button className="danger-text" disabled={busy || !canWrite || !editable} onClick={() => onAction("delete", record)}>Delete</button></div></td></tr>;
  })}</tbody></table></div>;
}
