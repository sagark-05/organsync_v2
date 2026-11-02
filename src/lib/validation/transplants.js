import { calendarDate, id, invalid } from "./records.js";
import { enumValue, objectFields } from "./workflows.js";
export const OUTCOMES = ["SUCCESSFUL", "COMPLICATIONS", "UNKNOWN"];
export function boundedText(value, field, max = 65535, nullable = true) {
  if (nullable && (value === null || value === undefined || value === "")) return null;
  if (typeof value !== "string" || !value.trim() || new TextEncoder().encode(value).length > max || /\x00/.test(value)) invalid(`${field} must be nonempty text of at most ${max} UTF-8 bytes.`);
  return value.trim();
}
export function utcTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z?$/.test(value)) invalid("performed_at must be a UTC date/time.");
  calendarDate(value.slice(0, 10), "performed_at");
  let full = value.replace(/Z$/, ""); if (full.length === 16) full += ":00";
  const date = new Date(`${full}Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 19) !== full || date > new Date()) invalid("performed_at must be a valid UTC time, not in the future.");
  return full.replace("T", " ");
}
export function allocationInput(input) { objectFields(input, ["match_id"], ["match_id"]); return { match_id: id(input.match_id, "match_id") }; }
export function transplantInput(input) {
  objectFields(input, ["allocation_id", "centre_id", "performed_at", "outcome", "notes"], ["allocation_id", "centre_id", "performed_at", "outcome"]);
  return { allocation_id: id(input.allocation_id, "allocation_id"), centre_id: id(input.centre_id, "centre_id"), performed_at: utcTimestamp(input.performed_at), outcome: enumValue(input.outcome, OUTCOMES, "outcome"), notes: boundedText(input.notes, "notes") };
}
export function followUpInput(input) {
  objectFields(input, ["transplant_id", "follow_up_date", "patient_status", "notes"], ["transplant_id", "follow_up_date", "patient_status"]);
  return { transplant_id: id(input.transplant_id, "transplant_id"), follow_up_date: calendarDate(input.follow_up_date, "follow_up_date"), patient_status: boundedText(input.patient_status, "patient_status", 60, false), notes: boundedText(input.notes, "notes") };
}
export function phase3eOptions(kind, input = {}) {
  const allowed = kind === "allocations" ? ["match_id", "allocation_status"] : kind === "follow-ups" ? ["transplant_id"] : ["outcome"];
  if (Object.keys(input).some(key => !["page", "pageSize", ...allowed].includes(key))) invalid("Unsupported query parameter.");
  const number = (value, fallback, max) => { if (value === undefined) return fallback; if (!/^[1-9]\d*$/.test(String(value)) || Number(value) > max) invalid("Invalid pagination."); return Number(value); };
  const result = { page: number(input.page, 1, 1000000), pageSize: number(input.pageSize, 10, 100) };
  for (const key of allowed) if (input[key]) result[key] = key.endsWith("_id") ? id(input[key], key) : enumValue(input[key], key === "outcome" ? OUTCOMES : ["RESERVED", "RELEASED", "COMPLETED"], key);
  return result;
}
