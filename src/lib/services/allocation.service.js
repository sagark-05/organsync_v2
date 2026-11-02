import { allocationRepository, transactionProcedure } from "../repositories/allocation.repository.js";
import { compatibilityRepository } from "../repositories/compatibility.repository.js";
import { matchRepository } from "../repositories/match.repository.js";
import { requireNoAllocation } from "../repositories/workflow.repository.js";
import { lockMatchContext, requireCandidateEligibility } from "./matching.service.js";
import { withTransaction } from "./record.service.js";
import { AppError, conflict, id } from "../validation/records.js";
import { notFound, requireCompatible } from "../validation/workflows.js";
import { allocationInput, phase3eOptions } from "../validation/transplants.js";
import { recordMutation } from "../sync/outbox.js";

export async function requireActor(actorId, db) {
  actorId = id(actorId, "clinician");
  if (!await compatibilityRepository.clinician(actorId, db)) throw new AppError(403, "CLINICIAN_REQUIRED", "An existing active clinician is required.");
  return actorId;
}
export async function requireEvidence(matchId, db) {
  const latest = await compatibilityRepository.latest(matchId, db); requireCompatible(latest);
  const [rows] = await db.execute("SELECT ct.test_id FROM compatibility_test ct JOIN app_user u ON u.user_id = ct.performed_by WHERE ct.test_id = ? AND u.role = 'CLINICIAN' AND u.is_active = TRUE FOR SHARE", [latest.test_id]);
  if (!rows.length) conflict("The latest compatible evidence must reference an existing active clinician.");
}
export async function allocationContext(value, db) {
  const hint = await allocationRepository.get(value, db); if (!hint) notFound();
  const context = await lockMatchContext(hint.match_id, db);
  const allocation = await allocationRepository.lock(value, db); if (!allocation) notFound();
  return { ...context, allocation };
}
export function createAllocationService(transaction = withTransaction) {
  return {
    list: (query, db) => allocationRepository.list(phase3eOptions("allocations", query), db),
    async get(value, db) { return await allocationRepository.get(id(value), db) || notFound(); },
    async create(input, actorId) {
      const data = allocationInput(input);
      return transaction(async db => {
        actorId = await requireActor(actorId, db);
        const { organ, waiting, match } = await lockMatchContext(data.match_id, db);
        if (match.match_status !== "APPROVED") conflict("Allocation requires an APPROVED match.");
        await requireCandidateEligibility(organ, waiting, db); await requireEvidence(data.match_id, db); await requireNoAllocation(db, data.match_id);
        if (await matchRepository.competingApproval(waiting.waiting_id, organ.organ_id, data.match_id, db)) conflict("A competing approval exists.");
        const called = await transactionProcedure("allocate", [data.match_id, actorId], db);
        let value;
        if (called) value = String(called.result.allocation_id);
        else { value = await allocationRepository.create(data.match_id, db); await allocationRepository.reserve(organ.organ_id, waiting.waiting_id, value, db); await recordMutation(db, "organ_allocation", value, "CREATED", actorId); }
        return { ...await allocationRepository.get(value, db), execution: called ? "stored_procedure" : "application_transaction" };
      });
    },
    async release(value, actorId) {
      value = id(value);
      return transaction(async db => {
        actorId = await requireActor(actorId, db);
        const { organ, waiting, allocation } = await allocationContext(value, db);
        if (allocation.allocation_status !== "RESERVED" || organ.organ_status !== "RESERVED" || waiting.status !== "MATCHED") conflict("Only a consistent RESERVED allocation may be released.");
        if (!await allocationRepository.reservation(organ.organ_id, value, db)) conflict("The exact active reservation is missing.");
        const called = await transactionProcedure("release", [value, actorId], db);
        if (!called) { await allocationRepository.release(organ.organ_id, waiting.waiting_id, value, db); await recordMutation(db, "organ_allocation", value, "RELEASED", actorId); }
        return { ...await allocationRepository.get(value, db), execution: called ? "stored_procedure" : "application_transaction" };
      });
    },
  };
}
export const allocationService = createAllocationService();
