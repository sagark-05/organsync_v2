import fs from 'node:fs/promises';
import mysql from '../../node_modules/mysql2/promise.js';
process.loadEnvFile('.env.local');
const evidence={collectedAt:new Date().toISOString(),readOnly:true};
let db;
try {
 db=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE,connectTimeout:5000,supportBigNumbers:true,bigNumberStrings:true,dateStrings:true});
 if(process.env.MYSQL_DATABASE!=='organsync_v2') throw {code:'UNEXPECTED_DATABASE'};
 await db.query('START TRANSACTION READ ONLY');
 const queries={inventory:"SELECT TABLE_NAME,TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME",triggers:"SELECT TRIGGER_NAME,EVENT_OBJECT_TABLE,ACTION_TIMING,EVENT_MANIPULATION FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() ORDER BY TRIGGER_NAME",procedures:"SELECT ROUTINE_NAME,ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() ORDER BY ROUTINE_NAME",aggregate:"SELECT ot.organ_name,COUNT(o.organ_id) AS available_count FROM organ_type ot LEFT JOIN organ o ON ot.organ_type_id=o.organ_type_id AND o.organ_status='AVAILABLE' GROUP BY ot.organ_type_id,ot.organ_name",outbox:"SELECT status,COUNT(*) AS events FROM sync_outbox GROUP BY status",explain:"EXPLAIN SELECT organ_id,organ_type_id,organ_status FROM organ WHERE organ_status='AVAILABLE' AND organ_type_id=1"};
 for(const [name,sql]of Object.entries(queries))evidence[name]={sql,rows:(await db.query(sql))[0]};
 evidence.success=true; await db.rollback();
} catch(error){evidence.success=false;evidence.errorCode=/^[A-Z0-9_]+$/.test(error.code||'')?error.code:'CONNECTION_UNAVAILABLE';}finally{if(db)await db.end();}
await fs.writeFile('reports/assets/sql-readonly-evidence.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify({success:evidence.success,errorCode:evidence.errorCode,queries:Object.keys(evidence).length}));
