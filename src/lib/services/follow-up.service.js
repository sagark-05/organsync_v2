import { followUpRepository } from "../repositories/follow-up.repository.js";
import { requireActor } from "./allocation.service.js";
import { withTransaction } from "./record.service.js";
import { conflict, id } from "../validation/records.js";
import { notFound } from "../validation/workflows.js";
import { followUpInput, phase3eOptions } from "../validation/transplants.js";
import { recordMutation } from "../sync/outbox.js";
export function createFollowUpService(transaction = withTransaction) {
  return {
    list: (query, db) => followUpRepository.list(phase3eOptions("follow-ups", query), db),
    async get(value, db) { return await followUpRepository.get(id(value), db) || notFound(); },
    async create(input, actorId) {
      const data = followUpInput(input);
      return transaction(async db => {
        actorId = await requireActor(actorId, db);
        const [rows] = await db.execute("SELECT transplant_id, performed_at FROM transplant WHERE transplant_id = ? FOR UPDATE", [data.transplant_id]);
        if (!rows.length) notFound();
        if (data.follow_up_date < String(rows[0].performed_at).slice(0, 10)) conflict("Follow-up date cannot predate the transplant.");
        const value = await followUpRepository.create(data, actorId, db); await recordMutation(db, "transplant_follow_up", value, "CREATED", actorId);
        return followUpRepository.get(value, db);
      });
    },
  };
}
export const followUpService = createFollowUpService();
