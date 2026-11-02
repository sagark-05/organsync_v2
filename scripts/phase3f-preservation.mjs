import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { BSON } from "mongodb";
import { getMysqlPool } from "../src/lib/db/mysql.js";
import { getMongoDatabase, closeMongoConnection } from "../src/lib/db/mongodb.js";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const { EJSON } = BSON;
const hash = value => createHash("sha256").update(EJSON.stringify(value, { relaxed: false })).digest("hex");
const label = process.argv.find(arg => arg.startsWith("--baseline="))?.slice(11) || "phase3f";
if (!/^[a-z0-9-]{1,50}$/.test(label)) throw new Error("Invalid baseline label.");
const path = `.artifacts/${label}-baseline.json`;
async function snapshot() {
  const pool = getMysqlPool(), mongo = await getMongoDatabase();
  await mongo.command({ ping: 1 });
  const [tables] = await pool.query("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const mysql = {};
  for (const { name } of tables) {
    const [keys] = await pool.execute("SELECT COLUMN_NAME name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION", [name]);
    const [rows] = await pool.query(`SELECT * FROM \`${name}\``);
    mysql[name] = Object.fromEntries(rows.map(row => [JSON.stringify(keys.map(k => row[k.name])), hash(row)]));
  }
  const [triggers] = await pool.query("SELECT TRIGGER_NAME,ACTION_TIMING,EVENT_MANIPULATION,EVENT_OBJECT_TABLE,ACTION_STATEMENT FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME");
  const [procedures] = await pool.query("SELECT ROUTINE_NAME,ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() ORDER BY ROUTINE_NAME");
  const mongodb = {};
  for (const { name, type } of await mongo.listCollections().toArray()) if (type === "collection") mongodb[name] = Object.fromEntries((await mongo.collection(name).find({}).toArray()).map(doc => [EJSON.stringify(doc._id), hash(doc)]));
  return { mysql, mongodb, triggers: hash(triggers), procedures: hash(procedures), inventory: { tables: tables.length, triggers: triggers.length, procedures: procedures.length } };
}
try {
  const current = await snapshot();
  if (process.argv.includes("--capture")) { await fs.mkdir(".artifacts", { recursive: true }); await fs.writeFile(path, JSON.stringify(current)); console.log(JSON.stringify({ captured: true, inventory: current.inventory, originalMysqlRows: Object.values(current.mysql).reduce((n, rows) => n + Object.keys(rows).length, 0), originalMongoDocuments: Object.values(current.mongodb).reduce((n, rows) => n + Object.keys(rows).length, 0) })); }
  else {
    const original = JSON.parse(await fs.readFile(path, "utf8"));
    for (const system of ["mysql", "mongodb"]) for (const [table, rows] of Object.entries(original[system])) for (const [id, digest] of Object.entries(rows)) if (current[system][table]?.[id] !== digest) throw new Error("Original record changed.");
    if (original.triggers !== current.triggers || original.procedures !== current.procedures || JSON.stringify(original.inventory) !== JSON.stringify(current.inventory)) throw new Error("Database objects changed.");
    console.log(JSON.stringify({ originalRecordsUnchanged: true, inventory: current.inventory }));
  }
} catch { console.error("Preservation verification failed; no credentials or record contents printed."); process.exitCode = 1; }
finally { await closeMongoConnection(); await getMysqlPool().end(); }
