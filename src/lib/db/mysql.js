import mysql from "mysql2/promise";

// Initialize lazily so builds do not require database credentials.
export function getMysqlPool() {
  if (!globalThis.organSyncMysqlPool) {
    for (const key of ["MYSQL_HOST", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"]) {
      if (process.env[key] === undefined || (key !== "MYSQL_PASSWORD" && !process.env[key])) {
        throw new Error("MySQL configuration is incomplete.");
      }
    }
    const port = Number(process.env.MYSQL_PORT || 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid MySQL port.");
    globalThis.organSyncMysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 20,
      connectTimeout: 5000,
      enableKeepAlive: true,
      supportBigNumbers: true,
      bigNumberStrings: true,
      timezone: "Z",
      dateStrings: true,
    });
  }
  return globalThis.organSyncMysqlPool;
}
