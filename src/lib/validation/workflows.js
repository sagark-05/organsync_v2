import { AppError, conflict, id, invalid } from "./records.js";

export const WAITING_STATUSES = ["ACTIVE", "MATCHED", "COMPLETED", "CANCELLED"];
export const MATCH_STATUSES = ["PROPOSED", "TESTING", "APPROVED", "REJECTED", "CANCELLED"];
export const COMPONENT_RESULTS = ["COMPATIBLE", "INCOMPATIBLE", "UNKNOWN"];
export const OVERALL_RESULTS = ["COMPATIBLE", "INCOMPATIBLE", "INCONCLUSIVE"];
export const MATCH_TRANSITIONS = {
  PROPOSED: ["TESTING", "REJECTED", "CANCELLED"],
  TESTING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["CANCELLED"], REJECTED: [], CANCELLED: [],
};
export function objectFields(input, allowed, required = []) {
  if (!input || typeof input !== "object" || Array.isArray(input) || !Object.keys(input).length || Object.keys(input).some(key => !allowed.includes(key))) invalid("A nonempty JSON object with supported fields is required.");
  if (required.some(key => !Object.hasOwn(input, key))) invalid(`Required fields: ${required.join(", ")}.`);
}
export function enumValue(value, values, field) {
  if (!values.includes(value)) invalid(`${field} must be one of: ${values.join(", ")}.`);
  return value;
}
export function priority(value) {
  if (!/^[1-5]$/.test(String(value)) || !["number", "string"].includes(typeof value)) invalid("priority_level must be an integer from 1 to 5.");
  return Number(value);
}
export function waitingInput(input, partial = false) {
  const keys = ["patient_id", "organ_type_id", "centre_id", "priority_level", "status"];
  objectFields(input, keys, partial ? [] : keys.slice(0, 4));
  const data = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "priority_level") data[key] = priority(value);
    else if (key === "status") data[key] = enumValue(value, WAITING_STATUSES, key);
    else data[key] = id(value, key, key === "organ_type_id" ? 65535n : undefined);
  }
  if (data.status && (partial ? data.status !== "CANCELLED" : data.status !== "ACTIVE")) conflict("New registrations must be ACTIVE. Generic updates may only cancel an unreferenced ACTIVE registration; MATCHED and COMPLETED belong to allocation/transplant workflows.");
  if (!partial) data.status = "ACTIVE";
  return data;
}
export function matchInput(input) {
  objectFields(input, ["waiting_id", "organ_id"], ["waiting_id", "organ_id"]);
  return { waiting_id: id(input.waiting_id, "waiting_id"), organ_id: id(input.organ_id, "organ_id") };
}
export function matchUpdate(input) {
  objectFields(input, ["match_status"], ["match_status"]);
  return enumValue(input.match_status, MATCH_STATUSES, "match_status");
}
export function requireTransition(current, next) {
  if (!MATCH_TRANSITIONS[current]?.includes(next)) conflict(`Match status cannot move from ${current} to ${next}.`);
}
export function requireCompatible(test) {
  if (!test || test.overall_result !== "COMPATIBLE" || test.blood_group_result !== "COMPATIBLE" || test.hla_result !== "COMPATIBLE") conflict("Approval requires the latest test to have COMPATIBLE overall, blood-group, and HLA results. These are fictional educational assessments, not clinical validation.");
}
export function compatibilityInput(input) {
  objectFields(input, ["match_id", "performed_by", "blood_group_result", "hla_result", "overall_result", "remarks"], ["match_id", "performed_by", "blood_group_result", "hla_result", "overall_result"]);
  const data = { match_id: id(input.match_id, "match_id"), performed_by: id(input.performed_by, "performed_by"), blood_group_result: enumValue(input.blood_group_result, COMPONENT_RESULTS, "blood_group_result"), hla_result: enumValue(input.hla_result, COMPONENT_RESULTS, "hla_result"), overall_result: enumValue(input.overall_result, OVERALL_RESULTS, "overall_result"), remarks: input.remarks ?? null };
  if (data.remarks === "") data.remarks = null;
  if (data.remarks !== null && (typeof data.remarks !== "string" || new TextEncoder().encode(data.remarks).length > 65535 || /\x00/.test(data.remarks))) invalid("remarks must be text of at most 65535 UTF-8 bytes.");
  if (data.overall_result === "COMPATIBLE") requireCompatible(data);
  return data;
}
export function workflowOptions(kind, input = {}) {
  const filters = kind === "waiting" ? ["patient_id", "organ_type_id", "centre_id", "priority_level", "status"] : kind === "compatibility" ? ["match_id"] : ["organ_id", "patient_id", "centre_id", "organ_type_id", "waiting_id", ...(kind === "matches" ? ["match_status"] : [])];
  if (Object.keys(input).some(key => !["search", "page", "pageSize", ...filters].includes(key))) invalid("Unsupported query parameter.");
  const integer = (value, fallback, max) => {
    if (value === undefined) return fallback;
    if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) > max) invalid("Invalid pagination: pageSize 1–100, page 1–1000000.");
    return Number(value);
  };
  const result = { page: integer(input.page, 1, 1000000), pageSize: integer(input.pageSize, 10, 100), search: input.search ?? "" };
  if (typeof result.search !== "string" || result.search.length > 120) invalid("Search must be text of at most 120 characters.");
  result.search = result.search.trim();
  for (const key of filters) {
    const value = input[key]; if (value === undefined || value === "") continue;
    result[key] = key === "priority_level" ? priority(value) : key === "status" ? enumValue(value, WAITING_STATUSES, key) : key === "match_status" ? enumValue(value, MATCH_STATUSES, key) : id(value, key, key === "organ_type_id" ? 65535n : undefined);
  }
  return result;
}
export function notFound() { throw new AppError(404, "NOT_FOUND", "Record not found."); }
