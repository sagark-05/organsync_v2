import { decimalId } from "../sync/documents.js";
import { PROJECTIONS, projectionSpec } from "../sync/projection-schema.js";
export const projectionRepository = {
  async read(db, table, id) {
    const mapping = projectionSpec(table);
    const [rows] = await db.execute(`SELECT ${mapping.fields.map(field => `\`${field}\``).join(",")} FROM \`${table}\` WHERE \`${mapping.pk}\`=?`, [decimalId(id)]);
    return rows[0] || null;
  },
  async ids(db, table, after = "0", limit = 100) {
    const { pk } = projectionSpec(table);
    if (after !== "0") decimalId(after);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error("Invalid projection page.");
    return (await db.execute(`SELECT CAST(\`${pk}\` AS CHAR) id FROM \`${table}\` WHERE \`${pk}\`>? ORDER BY \`${pk}\` LIMIT ${limit}`, [after]))[0].map(row => row.id);
  },
  async targets(db, event) {
    if (!Object.hasOwn(PROJECTIONS, event.aggregate_type)) return [];
    const targets = [[event.aggregate_type, decimalId(event.aggregate_id)]];
    let matchId;
    if (event.aggregate_type === "organ_allocation") matchId = (await this.read(db, "organ_allocation", event.aggregate_id))?.match_id;
    if (event.aggregate_type === "transplant") {
      const transplant = await this.read(db, "transplant", event.aggregate_id);
      if (transplant) { targets.push(["organ_allocation", decimalId(transplant.allocation_id)]); matchId = (await this.read(db, "organ_allocation", transplant.allocation_id))?.match_id; }
    }
    if (matchId) {
      const match = await this.read(db, "organ_match", matchId);
      if (match) targets.push(["organ", decimalId(match.organ_id)], ["waiting_list", decimalId(match.waiting_id)]);
    }
    return targets.sort((a, b) => `${a[0]}:${a[1]}` < `${b[0]}:${b[1]}` ? -1 : `${a[0]}:${a[1]}` > `${b[0]}:${b[1]}` ? 1 : 0);
  },
};
