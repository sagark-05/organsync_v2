import { getMysqlPool } from "../db/mysql.js";
import { fields } from "../validation/records.js";

// All identifiers and SQL fragments come exclusively from these internal definitions.
const definitions = {
  donor: { alias: "d", columns: "d.donor_id, d.centre_id, d.full_name, DATE_FORMAT(d.date_of_birth, '%Y-%m-%d') AS date_of_birth, d.blood_group, d.donor_type, d.contact_phone, d.registered_at, c.centre_name", joins: "JOIN transplant_centre c ON c.centre_id = d.centre_id", search: ["d.full_name", "c.centre_name"], dependencies: [["organ", "donor_id"]] },
  patient: { alias: "p", columns: "p.patient_id, p.centre_id, p.full_name, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS date_of_birth, p.sex, p.blood_group, p.contact_phone, p.city, p.registered_at, c.centre_name", joins: "JOIN transplant_centre c ON c.centre_id = p.centre_id", search: ["p.full_name", "p.city", "c.centre_name"], dependencies: [["waiting_list", "patient_id"], ["medical_record", "patient_id"]] },
  organ: { alias: "o", columns: "o.organ_id, o.donor_id, o.organ_type_id, o.centre_id, o.organ_status, DATE_FORMAT(o.retrieved_at, '%Y-%m-%dT%H:%i:%sZ') AS retrieved_at, o.created_at, d.full_name AS donor_name, d.blood_group, t.organ_name, c.centre_name", joins: "JOIN donor d ON d.donor_id = o.donor_id JOIN organ_type t ON t.organ_type_id = o.organ_type_id JOIN transplant_centre c ON c.centre_id = o.centre_id", search: ["d.full_name", "t.organ_name", "c.centre_name"], dependencies: [["organ_match", "organ_id"], ["active_organ_reservation", "organ_id"], ["organ_transplant_record", "organ_id"]] },
};
export function createRepository(entity) {
  const { alias, columns, joins, search, dependencies } = definitions[entity];
  const primary = `${entity}_id`;
  const from = `${entity} ${alias} ${joins}`;
  return {
    async list(options, db = getMysqlPool()) {
      const where = [], values = [];
      if (options.search) {
        // LOCATE treats user wildcard characters literally.
        where.push(`(${search.map(col => `LOCATE(?, ${col}) > 0`).join(" OR ")})`);
        values.push(...search.map(() => options.search));
      }
      for (const key of ["centre_id", "blood_group", "donor_type", "sex", "organ_status", "organ_type_id", "donor_id"]) {
        if (fields[entity].includes(key) && options[key]) { where.push(`${alias}.${key} = ?`); values.push(options[key]); }
      }
      const predicate = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      const [[count]] = await db.execute(`SELECT COUNT(*) AS total FROM ${from}${predicate}`, values);
      const [data] = await db.query(`SELECT ${columns} FROM ${from}${predicate} ORDER BY ${alias}.${primary} DESC LIMIT ? OFFSET ?`, [...values, options.pageSize, (options.page - 1) * options.pageSize]);
      return { data, pagination: { page: options.page, pageSize: options.pageSize, total: Number(count.total), totalPages: Math.ceil(Number(count.total) / options.pageSize) } };
    },
    async get(recordId, db = getMysqlPool(), lock = false) {
      if (lock) {
        const [rows] = await db.execute(`SELECT ${primary} FROM ${entity} WHERE ${primary} = ? FOR UPDATE`, [recordId]);
        if (!rows.length) return null;
      }
      const [rows] = await db.execute(`SELECT ${columns} FROM ${from} WHERE ${alias}.${primary} = ?`, [recordId]);
      return rows[0] || null;
    },
    async create(data, db = getMysqlPool()) {
      const keys = fields[entity].filter(key => Object.hasOwn(data, key));
      // LAST_INSERT_ID is read as a string to preserve BIGINT precision.
      const owned = typeof db.getConnection === "function";
      const connection = owned ? await db.getConnection() : db;
      try {
        await connection.execute(`INSERT INTO ${entity} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`, keys.map(key => data[key]));
        const [[row]] = await connection.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
        return row.id;
      } finally { if (owned) connection.release(); }
    },
    async update(recordId, data, db = getMysqlPool()) {
      const keys = fields[entity].filter(key => Object.hasOwn(data, key));
      await db.execute(`UPDATE ${entity} SET ${keys.map(key => `${key} = ?`).join(", ")} WHERE ${primary} = ?`, [...keys.map(key => data[key]), recordId]);
    },
    async delete(recordId, db = getMysqlPool()) { await db.execute(`DELETE FROM ${entity} WHERE ${primary} = ?`, [recordId]); },
    async isReferenced(recordId, db = getMysqlPool()) {
      for (const [table, column] of dependencies) {
        const [rows] = await db.execute(`SELECT ${column} FROM ${table} WHERE ${column} = ? LIMIT 1 FOR UPDATE`, [recordId]);
        if (rows.length) return true;
      }
      return false;
    },
  };
}

export async function referenceExists(table, recordId, db) {
  const keys = { transplant_centre: "centre_id", donor: "donor_id", organ_type: "organ_type_id" };
  if (!keys[table]) throw new Error("Unsupported reference.");
  const [rows] = await db.execute(`SELECT ${keys[table]} FROM ${table} WHERE ${keys[table]} = ? FOR SHARE`, [recordId]);
  return rows.length > 0;
}
export async function getReferenceData(db = getMysqlPool()) {
  const [centres] = await db.query("SELECT centre_id, centre_name, is_active FROM transplant_centre ORDER BY centre_name");
  const [organTypes] = await db.query("SELECT organ_type_id, organ_name, is_active FROM organ_type ORDER BY organ_name");
  return { centres, organTypes };
}
