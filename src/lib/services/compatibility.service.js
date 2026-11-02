import { compatibilityRepository } from "../repositories/compatibility.repository.js";
import { requireNoAllocation } from "../repositories/workflow.repository.js";
import { recordMutation } from "../sync/outbox.js";
import { AppError, conflict, id } from "../validation/records.js";
import { compatibilityInput, notFound, workflowOptions } from "../validation/workflows.js";
import { lockMatchContext, requireCandidateEligibility } from "./matching.service.js";
import { withTransaction } from "./record.service.js";

export function createCompatibilityService(transaction = withTransaction) {
  return {
    list: (query, db) => compatibilityRepository.list(workflowOptions("compatibility", query), db),
    async get(value, db) { return await compatibilityRepository.get(id(value), db) || notFound(); },
    clinicians: db => compatibilityRepository.clinicians(db),
    async create(input) {
      const data = compatibilityInput(input);
      return transaction(async db => {
        const { organ, waiting, match } = await lockMatchContext(data.match_id, db);
        if (match.match_status !== "TESTING") conflict("New test evidence may only be appended to a TESTING match. Existing and approved test history cannot be overwritten.");
        await requireCandidateEligibility(organ, waiting, db);
        await requireNoAllocation(db, data.match_id);
        if (!(await compatibilityRepository.clinicians(db)).length) throw new AppError(409, "CLINICIAN_REQUIRED", "Compatibility entry is read-only: no active CLINICIAN app_user exists. A valid clinician must be provided through the future authorized user setup; no user will be fabricated.");
        if (!await compatibilityRepository.clinician(data.performed_by, db)) throw new AppError(400, "INVALID_REFERENCE", "performed_by must reference an existing active CLINICIAN user. Selecting a reference does not authenticate that user.");
        const value = await compatibilityRepository.create(data, db);
        await recordMutation(db, "compatibility_test", value, "CREATED");
        return compatibilityRepository.get(value, db);
      });
    },
  };
}
export const compatibilityService = createCompatibilityService();
