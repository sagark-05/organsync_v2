import { transplantRepository } from "../repositories/transplant.repository.js";
import { allocationRepository, transactionProcedure } from "../repositories/allocation.repository.js";
import { requireReference } from "../repositories/workflow.repository.js";
import { allocationContext, requireActor, requireEvidence } from "./allocation.service.js";
import { withTransaction } from "./record.service.js";
import { conflict, id } from "../validation/records.js";
import { notFound } from "../validation/workflows.js";
import { phase3eOptions, transplantInput } from "../validation/transplants.js";
import { recordMutation } from "../sync/outbox.js";
export function createTransplantService(transaction = withTransaction) {
  return {
    list: (query, db) => transplantRepository.list(phase3eOptions("transplants", query), db),
    async get(value, db) { return await transplantRepository.get(id(value), db) || notFound(); },
    async create(input, actorId) {
      const data = transplantInput(input);
      return transaction(async db => {
        actorId = await requireActor(actorId, db);
        const { organ, waiting, match, allocation } = await allocationContext(data.allocation_id, db);
        if (allocation.allocation_status !== "RESERVED" || organ.organ_status !== "RESERVED" || waiting.status !== "MATCHED" || match.match_status !== "APPROVED") conflict("Transplantation requires an approved match with a consistent reserved allocation.");
        await requireEvidence(match.match_id, db); await requireReference(db, "transplant_centre", data.centre_id);
        if (data.performed_at < String(allocation.allocated_at).replace("T", " ").slice(0, 19)) conflict("The transplant cannot predate the allocation.");
        if (!await allocationRepository.reservation(organ.organ_id, data.allocation_id, db)) conflict("The exact active reservation is missing.");
        if (await transplantRepository.exists(data.allocation_id, organ.organ_id, db)) conflict("This organ or allocation already has a transplant record.");
        const called = await transactionProcedure("transplant", [data.allocation_id, data.centre_id, data.performed_at, data.outcome, data.notes, actorId], db);
        let value;
        if (called) value = String(called.result.transplant_id);
        else { value = await transplantRepository.create(data, db); await transplantRepository.complete(organ.organ_id, waiting.waiting_id, data.allocation_id, value, db); await recordMutation(db, "transplant", value, "COMPLETED", actorId); }
        return { ...await transplantRepository.get(value, db), execution: called ? "stored_procedure" : "application_transaction" };
      });
    },
  };
}
export const transplantService = createTransplantService();
