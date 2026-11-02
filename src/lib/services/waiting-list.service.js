import { waitingListRepository } from "../repositories/waiting-list.repository.js";
import { lockWaiting, requireReference } from "../repositories/workflow.repository.js";
import { recordMutation } from "../sync/outbox.js";
import { conflict, id } from "../validation/records.js";
import { notFound, waitingInput, workflowOptions } from "../validation/workflows.js";
import { withTransaction } from "./record.service.js";

export function createWaitingListService(transaction = withTransaction, repository = waitingListRepository) {
  async function references(data, db) {
    for (const [key, table] of [["patient_id", "patient"], ["organ_type_id", "organ_type"], ["centre_id", "transplant_centre"]]) await requireReference(db, table, data[key]);
  }
  return {
    list: (query, db) => repository.list(workflowOptions("waiting", query), db),
    async get(value, db) { return await repository.get(id(value), db) || notFound(); },
    async create(input) {
      const data = waitingInput(input);
      return transaction(async db => {
        await references(data, db);
        if (await repository.duplicate(data.patient_id, data.organ_type_id, "0", db)) conflict("An ACTIVE or MATCHED registration already exists for this patient and organ type.");
        const value = await repository.create(data, db);
        await recordMutation(db, "waiting_list", value, "CREATED");
        return repository.get(value, db);
      });
    },
    async update(value, input) {
      value = id(value); const data = waitingInput(input, true);
      return transaction(async db => {
        const row = await lockWaiting(db, value); if (!row) notFound();
        if (row.status !== "ACTIVE" || await repository.referenced(value, db)) conflict("Only unreferenced ACTIVE registrations may be edited or cancelled here. Match history must be preserved.");
        const merged = { ...row, ...data }; await references(merged, db);
        if (merged.status === "ACTIVE" && await repository.duplicate(merged.patient_id, merged.organ_type_id, value, db)) conflict("An ACTIVE or MATCHED registration already exists for this patient and organ type.");
        await repository.update(value, data, db);
        await recordMutation(db, "waiting_list", value, "UPDATED");
        return repository.get(value, db);
      });
    },
    async delete(value) {
      value = id(value);
      return transaction(async db => {
        const row = await lockWaiting(db, value); if (!row) notFound();
        if (!["ACTIVE", "CANCELLED"].includes(row.status) || await repository.referenced(value, db)) conflict("Only unreferenced ACTIVE or CANCELLED registrations may be deleted.");
        await repository.delete(value, db); await recordMutation(db, "waiting_list", value, "DELETED");
        return { waiting_id: value, deleted: true };
      });
    },
  };
}
export const waitingListService = createWaitingListService();
