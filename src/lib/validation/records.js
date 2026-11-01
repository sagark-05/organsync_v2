export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const DONOR_TYPES = ["LIVING", "DECEASED"];
export const SEXES = ["FEMALE", "MALE", "OTHER", "UNDISCLOSED"];
export const ORGAN_STATUSES = ["AVAILABLE", "RESERVED", "TRANSPLANTED", "DISCARDED"];

export class AppError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export const invalid = (message) => { throw new AppError(400, "INVALID_INPUT", message); };
export const conflict = (message) => { throw new AppError(409, "CONFLICT", message); };
export function id(value, field = "id", max = 18446744073709551615n) {
  if ((typeof value !== "string" && typeof value !== "number") ||
      (typeof value === "number" && !Number.isSafeInteger(value)) ||
      !/^[1-9]\d{0,19}$/.test(String(value)) || BigInt(value) > max) invalid(`${field} must be a positive integer ID.`);
  return String(value);
}
function text(value, field, length, optional = false) {
  if (optional && (value === null || value === "")) return null;
  if (typeof value !== "string" || !value.trim() || [...value.trim()].length > length || /[\x00-\x1f\x7f]/.test(value)) invalid(`${field} must contain 1–${length} characters.`);
  return value.trim();
}
function enumeration(value, field, values) {
  if (!values.includes(value)) invalid(`${field} must be one of: ${values.join(", ")}.`);
  return value;
}
export function calendarDate(value, field = "date_of_birth", now = new Date()) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid(`${field} must use YYYY-MM-DD.`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < "1900-01-01" || value > now.toISOString().slice(0, 10)) invalid(`${field} must be a valid date between 1900-01-01 and today.`);
  return value;
}
function retrievedAt(value) {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z?$/.test(value)) invalid("retrieved_at must be a UTC date/time (YYYY-MM-DDTHH:mm:ssZ).");
  calendarDate(value.slice(0, 10), "retrieved_at");
  const normalized = value.replace(/Z$/, "");
  const full = normalized.length === 16 ? `${normalized}:00` : normalized;
  const parsed = new Date(`${full}Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 19) !== full || parsed > new Date()) invalid("retrieved_at must be a valid UTC time, not in the future.");
  return full.replace("T", " ");
}
export const fields = {
  donor: ["centre_id", "full_name", "date_of_birth", "blood_group", "donor_type", "contact_phone"],
  patient: ["centre_id", "full_name", "date_of_birth", "sex", "blood_group", "contact_phone", "city"],
  organ: ["donor_id", "organ_type_id", "centre_id", "organ_status", "retrieved_at"],
};
export function validateRecord(entity, input, partial = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) invalid("A JSON object is required.");
  const allowed = fields[entity];
  if (!Object.keys(input).length || Object.keys(input).some(key => !allowed.includes(key))) invalid("Empty request or unsupported fields.");
  const required = entity === "organ" ? ["donor_id", "organ_type_id", "centre_id"] : ["centre_id", "full_name", "date_of_birth", "blood_group", entity === "donor" ? "donor_type" : "sex"];
  if (!partial && required.some(key => !Object.hasOwn(input, key))) invalid(`Required fields: ${required.join(", ")}.`);
  const result = {};
  for (const [key, value] of Object.entries(input)) {
    if (key.endsWith("_id")) result[key] = id(value, key, key === "organ_type_id" ? 65535n : undefined);
    else if (key === "full_name") result[key] = text(value, key, 120);
    else if (key === "city") result[key] = text(value, key, 100, true);
    else if (key === "contact_phone") result[key] = text(value, key, 20, true);
    else if (key === "date_of_birth") result[key] = calendarDate(value);
    else if (key === "blood_group") result[key] = enumeration(value, key, BLOOD_GROUPS);
    else if (key === "donor_type") result[key] = enumeration(value, key, DONOR_TYPES);
    else if (key === "sex") result[key] = enumeration(value, key, SEXES);
    else if (key === "retrieved_at") result[key] = retrievedAt(value);
    else if (key === "organ_status") result[key] = enumeration(value, key, ORGAN_STATUSES);
  }
  if (entity === "organ" && Object.hasOwn(result, "organ_status")) {
    if (partial || result.organ_status !== "AVAILABLE") conflict("Organ status is controlled by matching, allocation, and transplant workflows. New organs must be AVAILABLE.");
  }
  if (!partial) {
    if (entity === "organ") { result.organ_status = "AVAILABLE"; result.retrieved_at ??= null; }
    else { result.contact_phone ??= null; if (entity === "patient") result.city ??= null; }
  }
  return result;
}
export function listOptions(entity, input = {}) {
  const allowed = ["page", "pageSize", "search", "centre_id", ...(entity === "organ" ? ["organ_status", "organ_type_id", "donor_id"] : ["blood_group", entity === "donor" ? "donor_type" : "sex"])];
  if (Object.keys(input).some(key => !allowed.includes(key))) invalid("Unsupported query parameter.");
  const integer = (value, fallback, max) => {
    if (value === undefined) return fallback;
    if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) > max) invalid("Invalid pagination. pageSize must be 1–100; page must be 1–1000000.");
    return Number(value);
  };
  const result = { page: integer(input.page, 1, 1000000), pageSize: integer(input.pageSize, 10, 100), search: "" };
  if (input.search !== undefined) { if (typeof input.search !== "string" || input.search.length > 120) invalid("Search must be at most 120 characters."); result.search = input.search.trim(); }
  for (const key of allowed.filter(k => !["page", "pageSize", "search"].includes(k))) {
    if (input[key] === undefined || input[key] === "") continue;
    if (key.endsWith("_id")) result[key] = id(input[key], key, key === "organ_type_id" ? 65535n : undefined);
    else result[key] = enumeration(input[key], key, key === "blood_group" ? BLOOD_GROUPS : key === "donor_type" ? DONOR_TYPES : key === "sex" ? SEXES : ORGAN_STATUSES);
  }
  return result;
}
