import { getMongoDatabase } from "../db/mongodb.js";
import { auditDocument, eventDocument, syncSource } from "./documents.js";
const concern = { w: "majority", wtimeoutMS: 10000 };
const fault = code => Object.assign(new Error("Synchronization persistence check failed."), { syncCode: code });
export function createAtlasSink(database = getMongoDatabase, source = syncSource()) {
  async function ensureCollection(db, name) {
    const rows = await db.listCollections({ name }, { nameOnly: false }).toArray();
    if (rows.length) { if (rows[0].type !== "collection") throw fault("COLLECTION_TYPE_CONFLICT"); return; }
    try { await db.createCollection(name, { writeConcern: concern }); } catch (error) { if (error.code !== 48) throw error; }
  }
  async function store(db, collectionName, document) {
    await ensureCollection(db, collectionName);
    const collection = db.collection(collectionName);
    try {
      const result = await collection.updateOne({ _id: document._id }, { $setOnInsert: document }, { upsert: true, writeConcern: concern });
      if (!result.acknowledged) throw fault("WRITE_NOT_ACKNOWLEDGED");
    } catch (error) { if (error.code !== 11000) throw error; /* Parallel upsert: verify the winner. */ }
    const actual = await collection.findOne({ _id: document._id }, { readConcern: { level: "majority" }, maxTimeMS: 10000 });
    if (!actual || Object.entries(document).some(([key, value]) => JSON.stringify(actual[key]) !== JSON.stringify(value))) throw fault("IMMUTABLE_DOCUMENT_CONFLICT");
  }
  return {
    async persist(event, auditRows) {
      const db = await database();
      const document = eventDocument(event, source);
      await store(db, "sync_events", document);
      let auditCount = 0;
      for (const row of auditRows) { const audit = auditDocument(row, source); if (audit) { await store(db, "audit_history", audit); auditCount++; } }
      return { event_id: document.event_id, document_id: document._id, auditCount };
    },
  };
}
