import { createHash } from "node:crypto";

const ids = {
  donor: ["donor_id"], patient: ["patient_id"], organ: ["organ_id", "match_id", "allocation_id"],
  waiting_list: ["waiting_id"], organ_match: ["match_id"], compatibility_test: ["test_id"],
  organ_allocation: ["allocation_id"], transplant: ["transplant_id", "organ_id", "allocation_id", "centre_id"],
  transplant_follow_up: ["follow_up_id"], sync_demo: ["sync_demo_id"],
};
export const SYNC_COLLECTIONS = ["sync_events", "audit_history"];
export function syncSource() {
  const value = process.env.ORGANSYNC_SYNC_SOURCE || "organsync_v2";
  if (!/^[A-Za-z0-9_.-]{1,80}$/.test(value)) throw Object.assign(new Error("Invalid sync source identifier."), { syncCode: "SOURCE_CONFIGURATION" });
  return value;
}
export function decimalId(value) {
  if (typeof value === "number" && !Number.isSafeInteger(value)) throw Object.assign(new Error("Unsafe numeric source ID."), { syncCode: "SOURCE_DATA_INVALID" });
  const text = String(value);
  if (!/^[1-9]\d{0,19}$/.test(text) || BigInt(text) > 18446744073709551615n) throw Object.assign(new Error("Invalid source ID."), { syncCode: "SOURCE_DATA_INVALID" });
  return text;
}
const safeName = value => typeof value === "string" && /^[A-Za-z0-9_]{1,80}$/.test(value) ? value : "UNRECOGNIZED";
const stamp = value => value instanceof Date ? value.toISOString() : typeof value === "string" ? value : null;
function signedDocument(content, kind, source, value) {
  return { _id: `organsync-v2:${source}:${kind}:${decimalId(value)}`, ...content, content_sha256: createHash("sha256").update(JSON.stringify(content)).digest("hex") };
}
export function eventDocument(row, source = syncSource()) {
  let raw = row.payload;
  if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = {}; } }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};
  const aggregate = safeName(row.aggregate_type), allowed = Object.hasOwn(ids, aggregate) ? ids[aggregate] : null;
  const payload = {};
  if (allowed) {
    for (const key of allowed) if (raw[key] !== undefined) { try { payload[key] = decimalId(raw[key]); } catch { /* Never forward unvalidated values. */ } }
    if (typeof raw.action === "string" && /^[A-Z_]{1,30}$/.test(raw.action)) payload.action = raw.action;
  }
  const content = { schema_version: 1, source, event_id: decimalId(row.event_id), aggregate_type: aggregate,
    event_type: safeName(row.event_type), occurred_at: stamp(row.created_at), payload, redacted: !allowed };
  if (allowed) content.aggregate_id = decimalId(row.aggregate_id);
  return signedDocument(content, "outbox", source, row.event_id);
}
export function auditDocument(row, source = syncSource()) {
  // Authentication identities/sessions never become NoSQL audit projections.
  if (!Object.hasOwn(ids, row.entity_name)) return null;
  return signedDocument({ schema_version: 1, source, audit_id: decimalId(row.audit_id), entity_name: safeName(row.entity_name),
    entity_id: decimalId(row.entity_id), action: safeName(row.action), occurred_at: stamp(row.occurred_at) }, "audit", source, row.audit_id);
}
export function safeSyncError(error) {
  if (["PROJECTION_SCOPE_CONFLICT", "PROJECTION_BUSY", "PROJECTION_FENCED", "PROJECTION_NOT_CONFIRMED", "PROJECTION_DISABLED"].includes(error?.syncCode)) return error.syncCode;
  if (["ATLAS_CONFIGURATION", "SOURCE_CONFIGURATION", "SOURCE_DATA_INVALID", "IMMUTABLE_DOCUMENT_CONFLICT", "WRITE_NOT_ACKNOWLEDGED", "COLLECTION_TYPE_CONFLICT"].includes(error?.syncCode)) return error.syncCode;
  if (error?.code === 18) return "ATLAS_AUTHENTICATION";
  if (error?.code === 13) return "ATLAS_AUTHORIZATION";
  if (error?.name === "MongoServerSelectionError" || error?.name === "MongoNetworkError" || error?.name === "MongoNetworkTimeoutError") return "ATLAS_UNAVAILABLE";
  return "SYNC_OPERATION_FAILED";
}
