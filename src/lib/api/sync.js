import { requireDevelopmentWrite } from "../auth/development.js";
import { AppError } from "../validation/records.js";
import { json, readBody, respond } from "./records.js";
import { synchronizationStatus, createSyncDemonstration } from "../services/sync.service.js";
import { createSyncWorker } from "../sync/worker.js";

export const GET = () => respond(async () => json({ data: await synchronizationStatus() }));
export const POST = request => respond(async () => {
  requireDevelopmentWrite(request);
  if (process.env.ORGANSYNC_DEV_SYNC !== "true") throw new AppError(403, "SYNC_DISABLED", "Enable the development synchronization opt-in on the server.");
  const body = await readBody(request);
  if (!body || body.confirm !== true || !["demo", "run"].includes(body.action) || Object.keys(body).some(key => !["confirm", "action"].includes(key))) throw new AppError(400, "INVALID_INPUT", "Choose an authorized synchronization action and explicitly confirm it.");
  return json({ data: body.action === "demo" ? await createSyncDemonstration() : await createSyncWorker().runBatch(10) });
});
