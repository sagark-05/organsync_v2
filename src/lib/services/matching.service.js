import { matchRepository } from "../repositories/match.repository.js";
import { compatibilityRepository } from "../repositories/compatibility.repository.js";
import { lockOrgan, lockWaiting, requireNoAllocation, requireUnreserved } from "../repositories/workflow.repository.js";
import { recordMutation } from "../sync/outbox.js";
import { AppError, conflict, id } from "../validation/records.js";
import { matchInput, matchUpdate, notFound, requireCompatible, requireTransition, workflowOptions } from "../validation/workflows.js";
import { withTransaction } from "./record.service.js";

// Every candidate/status/test writer locks organ → waiting registration → match.
// Pair identifiers never change through these APIs; locking parent rows serializes proposals.
export async function lockMatchContext(value, db) {
  const hint = await matchRepository.get(value, db); if (!hint) notFound();
  const organ = await lockOrgan(db, hint.organ_id);
  const waiting = await lockWaiting(db, hint.waiting_id);
  const match = await matchRepository.lock(value, db);
  if (!organ || !waiting || !match) notFound();
  return { organ, waiting, match };
}
export async function requireCandidateEligibility(organ, waiting, db) {
  if (organ.organ_status !== "AVAILABLE" || waiting.status !== "ACTIVE") conflict("Candidates require an ACTIVE waiting registration and AVAILABLE organ.");
  if (String(organ.organ_type_id) !== String(waiting.organ_type_id)) conflict("The organ type must match the waiting-list request.");
  await requireUnreserved(db, organ.organ_id);
}
export function createMatchingService(transaction = withTransaction) {
  return {
    list: (query, db) => matchRepository.list(workflowOptions("matches", query), db),
    candidates: (query, db) => matchRepository.candidates(workflowOptions("candidates", query), db),
    async get(value, db) { return await matchRepository.get(id(value), db) || notFound(); },
    async create(input) {
      const data = matchInput(input);
      return transaction(async db => {
        const organ = await lockOrgan(db, data.organ_id), waiting = await lockWaiting(db, data.waiting_id);
        if (!organ || !waiting) throw new AppError(400, "INVALID_REFERENCE", "The organ and waiting registration must both exist.");
        await requireCandidateEligibility(organ, waiting, db);
        if (await matchRepository.pairExists(data.waiting_id, data.organ_id, db)) conflict("This organ/registration pair already has match history; duplicate proposals are not allowed.");
        if (await matchRepository.competingApproval(data.waiting_id, data.organ_id, "0", db)) conflict("An approved match already exists for this organ or registration.");
        const value = await matchRepository.create(data, db);
        await recordMutation(db, "organ_match", value, "CREATED");
        return matchRepository.get(value, db);
      });
    },
    async update(value, input) {
      value = id(value); const next = matchUpdate(input);
      return transaction(async db => {
        const { organ, waiting, match } = await lockMatchContext(value, db);
        requireTransition(match.match_status, next);
        await requireNoAllocation(db, value);
        if (["TESTING", "APPROVED"].includes(next)) await requireCandidateEligibility(organ, waiting, db);
        if (next === "APPROVED") {
          requireCompatible(await compatibilityRepository.latest(value, db));
          if (await matchRepository.competingApproval(match.waiting_id, match.organ_id, value, db)) conflict("Another approved match already uses this organ or registration.");
        }
        await matchRepository.update(value, next, db);
        await recordMutation(db, "organ_match", value, "UPDATED");
        return matchRepository.get(value, db);
      });
    },
  };
}
export const matchingService = createMatchingService();
