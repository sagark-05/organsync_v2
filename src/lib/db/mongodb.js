import { MongoClient } from "mongodb";

export async function getMongoDatabase() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DATABASE) throw Object.assign(new Error("MongoDB configuration is incomplete."), { syncCode: "ATLAS_CONFIGURATION" });
  if (!globalThis.organSyncMongoPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      appName: "OrganSync-outbox", tls: true, tlsAllowInvalidCertificates: false, tlsAllowInvalidHostnames: false, retryWrites: true,
      serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, socketTimeoutMS: 10000,
      maxPoolSize: 5, readConcern: { level: "majority" },
      writeConcern: { w: "majority", wtimeoutMS: 10000 },
    });
    globalThis.organSyncMongoClient = client;
    globalThis.organSyncMongoPromise = client.connect().then(() => client.db(process.env.MONGODB_DATABASE)).catch(async error => {
      globalThis.organSyncMongoPromise = undefined; globalThis.organSyncMongoClient = undefined;
      await client.close().catch(() => {}); throw error;
    });
  }
  return globalThis.organSyncMongoPromise;
}
export async function closeMongoConnection() {
  const client = globalThis.organSyncMongoClient;
  globalThis.organSyncMongoClient = undefined; globalThis.organSyncMongoPromise = undefined;
  if (client) await client.close();
}
