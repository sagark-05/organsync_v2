import { getMysqlPool } from "../db/mysql.js";
import { referenceExists } from "../repositories/record.repository.js";
import { recordMutation } from "../sync/outbox.js";
import { AppError, conflict, id, listOptions, validateRecord } from "../validation/records.js";

export async function withTransaction(work) {
  const db = await getMysqlPool().getConnection();
  try { await db.beginTransaction(); const result = await work(db); await db.commit(); return result; }
  catch (error) { await db.rollback(); throw error; }
  finally { db.release(); }
}
// Transaction injection enables integration tests that always roll back fixtures.
export function createRecordService(entity, repository, transaction = withTransaction) {
  const missing = () => { throw new AppError(404, "NOT_FOUND", "Record not found."); };
  async function references(data, db) {
    for (const [field, table] of [["centre_id", "transplant_centre"], ["donor_id", "donor"], ["organ_type_id", "organ_type"]]) {
      if (Object.hasOwn(data, field) && !await referenceExists(table, data[field], db)) throw new AppError(400, "INVALID_REFERENCE", `${field} does not reference an existing record.`);
    }
  }
  return {
    list: (query, db) => repository.list(listOptions(entity, query), db),
    async get(value, db) { const row = await repository.get(id(value), db); if (!row) missing(); return row; },
    async create(input) {
      const data = validateRecord(entity, input);
      return transaction(async db => {
        await references(data, db);
        const recordId = await repository.create(data, db);
        await recordMutation(db, entity, recordId, "CREATED");
        return repository.get(recordId, db);
      });
    },
    async update(value, input) {
      const recordId = id(value), data = validateRecord(entity, input, true);
      return transaction(async db => {
        const existing = await repository.get(recordId, db, true); if (!existing) missing();
        // Preserve historical organ identity once any workflow references exist.
        if (entity === "organ" && (existing.organ_status !== "AVAILABLE" || await repository.isReferenced(recordId, db))) conflict("Only AVAILABLE organs without workflow references can be edited here.");
        // Blood group changes must not silently invalidate downstream assessments.
        if (entity !== "organ" && data.blood_group && data.blood_group !== existing.blood_group && await repository.isReferenced(recordId, db)) conflict("Blood group cannot change while dependent records exist.");
        await references(data, db);
        await repository.update(recordId, data, db);
        await recordMutation(db, entity, recordId, "UPDATED");
        return repository.get(recordId, db);
      });
    },
    async delete(value) {
      const recordId = id(value);
      return transaction(async db => {
        const existing = await repository.get(recordId, db, true); if (!existing) missing();
        if (entity === "organ" && existing.organ_status !== "AVAILABLE") conflict("Only AVAILABLE organs without workflow references may be deleted.");
        if (await repository.isReferenced(recordId, db)) conflict("This record has dependent records and cannot be deleted.");
        await repository.delete(recordId, db);
        await recordMutation(db, entity, recordId, "DELETED");
        return { [`${entity}_id`]: recordId, deleted: true };
      });
    },
  };
}
