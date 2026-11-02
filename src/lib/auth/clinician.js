import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { getMysqlPool } from "../db/mysql.js";
import { AppError, invalid } from "../validation/records.js";
import { objectFields } from "../validation/workflows.js";
import { boundedText } from "../validation/transplants.js";
import { withTransaction } from "../services/record.service.js";
import { recordMutation } from "../sync/outbox.js";
const scrypt = promisify(scryptCallback);
const digest = token => createHash("sha256").update(token).digest("hex");
export async function requireClinicianSession(request, db = getMysqlPool()) {
  const token = request.headers.get("x-clinician-session") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) throw new AppError(401, "CLINICIAN_SIGN_IN_REQUIRED", "Sign in with an existing development clinician account.");
  const [rows] = await db.execute("SELECT u.user_id, u.full_name FROM app_session s JOIN app_user u ON u.user_id = s.user_id WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.is_active = TRUE AND u.role = 'CLINICIAN'", [digest(token)]);
  if (!rows.length) throw new AppError(401, "CLINICIAN_SIGN_IN_REQUIRED", "The clinician session is invalid or expired.");
  return rows[0];
}
export function credentials(input, setup = false) {
  objectFields(input, setup ? ["full_name", "email", "password", "confirm_fictional"] : ["email", "password"], setup ? ["full_name", "email", "password", "confirm_fictional"] : ["email", "password"]);
  if (typeof input.email !== "string" || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) invalid("A valid fictional demonstration email is required.");
  if (typeof input.password !== "string" || input.password.length < 12 || input.password.length > 128) invalid("Password must contain 12–128 characters.");
  if (setup && input.confirm_fictional !== true) invalid("Explicit confirmation of a fictional demonstration identity is required.");
  return { email: input.email.trim().toLowerCase(), password: input.password, ...(setup ? { full_name: boundedText(input.full_name, "full_name", 120, false) } : {}) };
}
export async function setupClinician(input, transaction = withTransaction) {
  const data = credentials(input, true), salt = randomBytes(16).toString("hex");
  const hash = `scrypt:v1:${salt}:${Buffer.from(await scrypt(data.password, salt, 64)).toString("hex")}`;
  return transaction(async db => {
    await db.execute("INSERT INTO app_user (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'CLINICIAN', TRUE)", [data.full_name, data.email, hash]);
    const [[row]] = await db.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS user_id");
    await recordMutation(db, "app_user", row.user_id, "CREATED");
    return { user_id: row.user_id, full_name: data.full_name, message: "Fictional clinician created. Sign in using the supplied password. This account does not enable production access." };
  });
}
export async function signInClinician(input, transaction = withTransaction) {
  const data = credentials(input), token = randomBytes(32).toString("hex");
  return transaction(async db => {
    const [rows] = await db.execute("SELECT user_id, full_name, password_hash FROM app_user WHERE email = ? AND role = 'CLINICIAN' AND is_active = TRUE", [data.email]);
    const stored = rows[0]?.password_hash || "";
    const parts = stored.split(":");
    // Always perform a password derivation, including when the account is absent.
    const key = Buffer.from(await scrypt(data.password, parts[2] || "absent-development-account", 64));
    const expected = /^[a-f0-9]{128}$/.test(parts[3] || "") ? Buffer.from(parts[3], "hex") : Buffer.alloc(64);
    if (!rows.length || parts[0] !== "scrypt" || parts[1] !== "v1" || !timingSafeEqual(key, expected)) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid development clinician credentials.");
    await db.execute("INSERT INTO app_session (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR))", [rows[0].user_id, digest(token)]);
    const [[sessionRow]] = await db.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS session_id");
    await recordMutation(db, "app_session", sessionRow.session_id, "CREATED", rows[0].user_id);
    return { session: token, user: { user_id: rows[0].user_id, full_name: rows[0].full_name }, expires_in_seconds: 3600 };
  });
}
