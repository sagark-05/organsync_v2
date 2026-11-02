import { collectionHandlers, itemHandlers, json, readBody, respond } from "./records.js";
import { requireDevelopmentWrite } from "../auth/development.js";
import { requireClinicianSession } from "../auth/clinician.js";
export function clinicalCollection(service, authenticate = requireClinicianSession) {
  return { GET: collectionHandlers(service).GET, POST: request => respond(async () => {
    requireDevelopmentWrite(request); const actor = await authenticate(request);
    return json({ data: await service.create(await readBody(request), actor.user_id) }, 201);
  }) };
}
export function clinicalItem(service) { return { GET: itemHandlers(service).GET }; }
export function releaseHandler(service) {
  return (request, context) => respond(async () => { requireDevelopmentWrite(request); const actor = await requireClinicianSession(request); return json({ data: await service.release((await context.params).id, actor.user_id) }); });
}
