import { getReferenceData } from "@/lib/repositories/record.repository";
import { developmentWritesEnabled } from "@/lib/auth/development";
import { json, respond } from "@/lib/api/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return respond(async () => json({ data: { ...await getReferenceData(), developmentWritesEnabled: developmentWritesEnabled() } }));
}
