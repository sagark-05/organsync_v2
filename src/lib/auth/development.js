import { timingSafeEqual } from "node:crypto";
import { AppError } from "../validation/records.js";

export function developmentWritesEnabled(env = process.env) {
  return env.NODE_ENV === "development" && env.ORGANSYNC_DEV_WRITES === "true" && typeof env.ORGANSYNC_DEV_WRITE_TOKEN === "string" && env.ORGANSYNC_DEV_WRITE_TOKEN.length >= 32;
}
export function requireDevelopmentWrite(request, env = process.env) {
  const denied = () => { throw new AppError(403, "WRITE_FORBIDDEN", "Writes require local development mode, explicit server opt-in, and a valid development token. Production authorization is pending."); };
  if (!developmentWritesEnabled(env)) denied();
  const url = new URL(request.url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) denied();
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) denied();
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${env.ORGANSYNC_DEV_WRITE_TOKEN}`;
  const actualBuffer = Buffer.from(supplied), expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) denied();
}
