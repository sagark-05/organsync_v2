import { requireDevelopmentWrite } from "../auth/development.js";
import { AppError } from "../validation/records.js";

export function json(data, status = 200) {
  return Response.json({ success: true, ...data }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function respond(work) {
  try { return await work(); }
  catch (error) {
    let status = 500, code = "SERVER_ERROR", message = "The request could not be completed. Please try again.";
    if (error instanceof AppError) ({ status, code, message } = error);
    else if (["ER_DUP_ENTRY", "ER_ROW_IS_REFERENCED_2", "ER_NO_REFERENCED_ROW_2", "ER_CHECK_CONSTRAINT_VIOLATED", "ER_SIGNAL_EXCEPTION", "ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(error.code)) {
      status = 409; code = "DATABASE_CONFLICT"; message = "The operation conflicts with database constraints or dependent records.";
    }
    return Response.json({ success: false, error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
export async function readBody(request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new AppError(400, "INVALID_INPUT", "Content-Type must be application/json.");
  // Bound input without trusting Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, "INVALID_INPUT", "A JSON object is required.");
  let size = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 16384) { await reader.cancel(); throw new AppError(400, "INVALID_INPUT", "Request body is too large."); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "INVALID_INPUT", "Invalid JSON body.");
  }
}
export function collectionHandlers(service) {
  return {
    GET: request => respond(async () => {
      const params = new URL(request.url).searchParams;
      if ([...params.keys()].some(key => params.getAll(key).length > 1)) throw new AppError(400, "INVALID_INPUT", "Repeated query parameters are not supported.");
      return json(await service.list(Object.fromEntries(params)));
    }),
    POST: request => respond(async () => { requireDevelopmentWrite(request); return json({ data: await service.create(await readBody(request)) }, 201); }),
  };
}
export function itemHandlers(service) {
  return {
    GET: (request, context) => respond(async () => json({ data: await service.get((await context.params).id) })),
    PATCH: (request, context) => respond(async () => { requireDevelopmentWrite(request); return json({ data: await service.update((await context.params).id, await readBody(request)) }); }),
    DELETE: (request, context) => respond(async () => { requireDevelopmentWrite(request); return json({ data: await service.delete((await context.params).id) }); }),
  };
}
