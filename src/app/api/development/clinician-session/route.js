import { requireDevelopmentWrite } from "@/lib/auth/development";
import { signInClinician } from "@/lib/auth/clinician";
import { json, readBody, respond } from "@/lib/api/records";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function POST(request) { return respond(async () => { requireDevelopmentWrite(request); return json({ data: await signInClinician(await readBody(request)) }); }); }
