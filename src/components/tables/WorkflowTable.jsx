"use client";
export default function WorkflowTable({ rows, columns, caption, actions }) {
  return <div className="table-scroll"><table><caption className="sr-only">{caption}</caption><thead><tr>{columns.map(([key, label]) => <th key={key} scope="col">{label}</th>)}{actions && <th scope="col">Actions</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.follow_up_id || row.test_id || row.transplant_id || row.allocation_id || row.match_id || `${row.waiting_id}-${row.organ_id || index}`}>
    {columns.map(([key]) => <td key={key}>{key.includes("status") || key.includes("result") ? <span className="badge">{row[key] ?? "Not tested"}</span> : row[key] ?? "—"}</td>)}{actions && <td><div className="row-actions">{actions(row)}</div></td>}
  </tr>)}</tbody></table></div>;
}
