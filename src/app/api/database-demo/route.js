import { requireDevelopmentWrite } from "@/lib/auth/development";
import { AppError } from "@/lib/validation/records";
import { objectFields } from "@/lib/validation/workflows";
import { json, readBody, respond } from "@/lib/api/records";
import { databaseDemoCatalog, runDatabaseDemo } from "@/lib/services/database-demo.service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request) { return respond(async () => { requireDevelopmentWrite(request); return json({ data: { ...await databaseDemoCatalog(), executionEnabled: process.env.ORGANSYNC_DEV_DB_DEMO === "true" } }); }); }
export function POST(request) { return respond(async () => {
  requireDevelopmentWrite(request);
  if (process.env.ORGANSYNC_DEV_DB_DEMO !== "true") throw new AppError(403, "DEMO_DISABLED", "Set ORGANSYNC_DEV_DB_DEMO=true explicitly for local rollback demonstrations.");
  const input = await readBody(request); objectFields(input, ["scenario_id", "confirm_rollback"], ["scenario_id", "confirm_rollback"]);
  if (input.confirm_rollback !== true) throw new AppError(400, "CONFIRMATION_REQUIRED", "Confirm execution of isolated, rollback-only fictional fixtures.");
  return json({ data: await runDatabaseDemo(input.scenario_id) });
}); }
