import { createHash } from "node:crypto";
import { decimalId, syncSource } from "./documents.js";
const spec = (collection, pk, fields, enums = {}) => Object.freeze({ collection, pk, fields: Object.freeze([pk, ...fields]), enums });
export const PROJECTIONS = Object.freeze({
  donor: spec("donors", "donor_id", ["centre_id"]),
  patient: spec("patients", "patient_id", ["centre_id"]),
  organ: spec("organs", "organ_id", ["donor_id", "organ_type_id", "centre_id", "organ_status"], { organ_status: ["AVAILABLE", "RESERVED", "TRANSPLANTED", "DISCARDED"] }),
  waiting_list: spec("waiting_list", "waiting_id", ["patient_id", "organ_type_id", "centre_id", "status"], { status: ["ACTIVE", "MATCHED", "COMPLETED", "CANCELLED"] }),
  medical_record: spec("medical_records", "record_id", ["patient_id"]),
  organ_match: spec("matches", "match_id", ["waiting_id", "organ_id", "match_status"], { match_status: ["PROPOSED", "TESTING", "APPROVED", "REJECTED", "CANCELLED"] }),
  compatibility_test: spec("compatibility_tests", "test_id", ["match_id"]),
  organ_allocation: spec("organ_allocations", "allocation_id", ["match_id", "allocation_status"], { allocation_status: ["RESERVED", "RELEASED", "COMPLETED"] }),
  transplant: spec("transplants", "transplant_id", ["allocation_id", "centre_id"]),
  transplant_follow_up: spec("transplant_follow_ups", "follow_up_id", ["transplant_id"]),
  transplant_centre: spec("transplant_centres", "centre_id", ["is_active"]),
  organ_type: spec("organ_types", "organ_type_id", ["organ_name", "is_active"]),
});
export const PROJECTION_CONTROL = "projection_sync_state";
export const projectionEnabled = () => process.env.ORGANSYNC_BUSINESS_PROJECTIONS === "true";
export function projectionSpec(table) {
  if (!Object.hasOwn(PROJECTIONS, table)) throw new Error("Unsupported projection table.");
  return PROJECTIONS[table];
}
export const projectionId = (table, id, source = syncSource()) => { projectionSpec(table); return `organsync-v2:${source}:${table}:${decimalId(id)}`; };
export function projectionData(table, row) {
  if (!row) return null;
  const mapping = projectionSpec(table), data = {};
  for (const field of mapping.fields) {
    if (field.endsWith("_id")) data[field] = decimalId(row[field]);
    else if (field === "is_active") { if (![true, false, 0, 1].includes(row[field])) throw new Error("Invalid source boolean."); data[field] = Boolean(row[field]); }
    else if (field === "organ_name") { if (typeof row[field] !== "string" || !row[field].length || row[field].length > 50) throw new Error("Invalid source catalog label."); data[field] = row[field]; }
    else { if (!mapping.enums[field]?.includes(row[field])) throw new Error("Invalid source status."); data[field] = row[field]; }
  }
  return data;
}
export const projectionHash = data => createHash("sha256").update(JSON.stringify(data)).digest("hex");
export function projectionValidator(table) {
  const mapping = projectionSpec(table);
  const properties = Object.fromEntries(mapping.fields.map(field => [field, field.endsWith("_id") ? { bsonType: "string", pattern: "^[1-9][0-9]{0,19}$" } : field === "is_active" ? { bsonType: "bool" } : mapping.enums[field] ? { enum: mapping.enums[field] } : { bsonType: "string", maxLength: 50 }]));
  return { $jsonSchema: { title: "OrganSync business projection v1", bsonType: "object", additionalProperties: false,
    required: ["_id", "source", "table", "source_id", "schema_version", "data", "_sync"],
    properties: { _id: { bsonType: "string" }, source: { bsonType: "string" }, table: { enum: [table] }, source_id: { bsonType: "string" }, schema_version: { enum: [1] },
      data: { bsonType: ["object", "null"], additionalProperties: false, required: mapping.fields, properties },
      _sync: { bsonType: "object", additionalProperties: false, properties: { generation: { bsonType: ["long", "int", "double"] }, owner: { bsonType: "string" }, lease_until: { bsonType: "date" }, state: { enum: ["initializing", "ready", "deleted"] }, deleted: { bsonType: "bool" }, updated_at: { bsonType: "date" }, last_event_id: { bsonType: ["string", "null"] }, content_sha256: { bsonType: "string" } } } } } };
}
