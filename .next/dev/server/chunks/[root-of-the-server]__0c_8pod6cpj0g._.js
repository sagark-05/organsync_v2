module.exports = [
(()=>{"use strict";return[
"[project]/src/app/api/organs/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$organ$2e$service$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/services/organ.service.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/records.js [app-route] (ecmascript)");
;
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
const { GET, POST } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectionHandlers"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$organ$2e$service$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["organService"]);
}),
"[project]/src/lib/api/records.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectionHandlers",
    ()=>collectionHandlers,
    "itemHandlers",
    ()=>itemHandlers,
    "json",
    ()=>json,
    "readBody",
    ()=>readBody,
    "respond",
    ()=>respond
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$development$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/development.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-route] (ecmascript)");
;
;
function json(data, status = 200) {
    return Response.json({
        success: true,
        ...data
    }, {
        status,
        headers: {
            "Cache-Control": "no-store"
        }
    });
}
async function respond(work) {
    try {
        return await work();
    } catch (error) {
        let status = 500, code = "SERVER_ERROR", message = "The request could not be completed. Please try again.";
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]) ({ status, code, message } = error);
        else if ([
            "ER_DUP_ENTRY",
            "ER_ROW_IS_REFERENCED_2",
            "ER_NO_REFERENCED_ROW_2",
            "ER_CHECK_CONSTRAINT_VIOLATED",
            "ER_SIGNAL_EXCEPTION",
            "ER_LOCK_DEADLOCK",
            "ER_LOCK_WAIT_TIMEOUT"
        ].includes(error.code)) {
            status = 409;
            code = "DATABASE_CONFLICT";
            message = "The operation conflicts with database constraints or dependent records.";
        }
        return Response.json({
            success: false,
            error: {
                code,
                message
            }
        }, {
            status,
            headers: {
                "Cache-Control": "no-store"
            }
        });
    }
}
async function readBody(request) {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](400, "INVALID_INPUT", "Content-Type must be application/json.");
    // Bound input without trusting Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](400, "INVALID_INPUT", "A JSON object is required.");
    let size = 0;
    const chunks = [];
    try {
        while(true){
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 16384) {
                await reader.cancel();
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](400, "INVALID_INPUT", "Request body is too large.");
            }
            chunks.push(value);
        }
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]) throw error;
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](400, "INVALID_INPUT", "Invalid JSON body.");
    }
}
function collectionHandlers(service) {
    return {
        GET: (request)=>respond(async ()=>{
                const params = new URL(request.url).searchParams;
                if ([
                    ...params.keys()
                ].some((key)=>params.getAll(key).length > 1)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](400, "INVALID_INPUT", "Repeated query parameters are not supported.");
                return json(await service.list(Object.fromEntries(params)));
            }),
        POST: (request)=>respond(async ()=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$development$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireDevelopmentWrite"])(request);
                return json({
                    data: await service.create(await readBody(request))
                }, 201);
            })
    };
}
function itemHandlers(service) {
    return {
        GET: (request, context)=>respond(async ()=>json({
                    data: await service.get((await context.params).id)
                })),
        PATCH: (request, context)=>respond(async ()=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$development$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireDevelopmentWrite"])(request);
                return json({
                    data: await service.update((await context.params).id, await readBody(request))
                });
            }),
        DELETE: (request, context)=>respond(async ()=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$development$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireDevelopmentWrite"])(request);
                return json({
                    data: await service.delete((await context.params).id)
                });
            })
    };
}
}),
"[project]/src/lib/auth/development.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "developmentWritesEnabled",
    ()=>developmentWritesEnabled,
    "requireDevelopmentWrite",
    ()=>requireDevelopmentWrite
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-route] (ecmascript)");
;
;
function developmentWritesEnabled(env = process.env) {
    return env.NODE_ENV === "development" && env.ORGANSYNC_DEV_WRITES === "true" && typeof env.ORGANSYNC_DEV_WRITE_TOKEN === "string" && env.ORGANSYNC_DEV_WRITE_TOKEN.length >= 32;
}
function requireDevelopmentWrite(request, env = process.env) {
    const denied = ()=>{
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](403, "WRITE_FORBIDDEN", "Writes require local development mode, explicit server opt-in, and a valid development token. Production authorization is pending.");
    };
    if (!developmentWritesEnabled(env)) denied();
    const url = new URL(request.url);
    if (![
        "localhost",
        "127.0.0.1",
        "[::1]"
    ].includes(url.hostname)) denied();
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) denied();
    const supplied = request.headers.get("authorization") || "";
    const expected = `Bearer ${env.ORGANSYNC_DEV_WRITE_TOKEN}`;
    const actualBuffer = Buffer.from(supplied), expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(actualBuffer, expectedBuffer)) denied();
}
}),
"[project]/src/lib/db/mysql.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMysqlPool",
    ()=>getMysqlPool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/promise.js [app-route] (ecmascript)");
;
function getMysqlPool() {
    if (!globalThis.organSyncMysqlPool) {
        for (const key of [
            "MYSQL_HOST",
            "MYSQL_DATABASE",
            "MYSQL_USER",
            "MYSQL_PASSWORD"
        ]){
            if (process.env[key] === undefined || key !== "MYSQL_PASSWORD" && !process.env[key]) {
                throw new Error("MySQL configuration is incomplete.");
            }
        }
        const port = Number(process.env.MYSQL_PORT || 3306);
        if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid MySQL port.");
        globalThis.organSyncMysqlPool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createPool({
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
            dateStrings: true
        });
    }
    return globalThis.organSyncMysqlPool;
}
}),
"[project]/src/lib/repositories/organ.repository.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "organRepository",
    ()=>organRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$repositories$2f$record$2e$repository$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/repositories/record.repository.js [app-route] (ecmascript)");
;
const organRepository = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$repositories$2f$record$2e$repository$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRepository"])("organ");
}),
"[project]/src/lib/repositories/record.repository.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRepository",
    ()=>createRepository,
    "getReferenceData",
    ()=>getReferenceData,
    "referenceExists",
    ()=>referenceExists
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/mysql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-route] (ecmascript)");
;
;
// All identifiers and SQL fragments come exclusively from these internal definitions.
const definitions = {
    donor: {
        alias: "d",
        columns: "d.donor_id, d.centre_id, d.full_name, DATE_FORMAT(d.date_of_birth, '%Y-%m-%d') AS date_of_birth, d.blood_group, d.donor_type, d.contact_phone, d.registered_at, c.centre_name",
        joins: "JOIN transplant_centre c ON c.centre_id = d.centre_id",
        search: [
            "d.full_name",
            "c.centre_name"
        ],
        dependencies: [
            [
                "organ",
                "donor_id"
            ]
        ]
    },
    patient: {
        alias: "p",
        columns: "p.patient_id, p.centre_id, p.full_name, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS date_of_birth, p.sex, p.blood_group, p.contact_phone, p.city, p.registered_at, c.centre_name",
        joins: "JOIN transplant_centre c ON c.centre_id = p.centre_id",
        search: [
            "p.full_name",
            "p.city",
            "c.centre_name"
        ],
        dependencies: [
            [
                "waiting_list",
                "patient_id"
            ],
            [
                "medical_record",
                "patient_id"
            ]
        ]
    },
    organ: {
        alias: "o",
        columns: "o.organ_id, o.donor_id, o.organ_type_id, o.centre_id, o.organ_status, DATE_FORMAT(o.retrieved_at, '%Y-%m-%dT%H:%i:%sZ') AS retrieved_at, o.created_at, d.full_name AS donor_name, d.blood_group, t.organ_name, c.centre_name",
        joins: "JOIN donor d ON d.donor_id = o.donor_id JOIN organ_type t ON t.organ_type_id = o.organ_type_id JOIN transplant_centre c ON c.centre_id = o.centre_id",
        search: [
            "d.full_name",
            "t.organ_name",
            "c.centre_name"
        ],
        dependencies: [
            [
                "organ_match",
                "organ_id"
            ],
            [
                "active_organ_reservation",
                "organ_id"
            ],
            [
                "organ_transplant_record",
                "organ_id"
            ]
        ]
    }
};
function createRepository(entity) {
    const { alias, columns, joins, search, dependencies } = definitions[entity];
    const primary = `${entity}_id`;
    const from = `${entity} ${alias} ${joins}`;
    return {
        async list (options, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])()) {
            const where = [], values = [];
            if (options.search) {
                // LOCATE treats user wildcard characters literally.
                where.push(`(${search.map((col)=>`LOCATE(?, ${col}) > 0`).join(" OR ")})`);
                values.push(...search.map(()=>options.search));
            }
            for (const key of [
                "centre_id",
                "blood_group",
                "donor_type",
                "sex",
                "organ_status",
                "organ_type_id",
                "donor_id"
            ]){
                if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fields"][entity].includes(key) && options[key]) {
                    where.push(`${alias}.${key} = ?`);
                    values.push(options[key]);
                }
            }
            const predicate = where.length ? ` WHERE ${where.join(" AND ")}` : "";
            const [[count]] = await db.execute(`SELECT COUNT(*) AS total FROM ${from}${predicate}`, values);
            const [data] = await db.query(`SELECT ${columns} FROM ${from}${predicate} ORDER BY ${alias}.${primary} DESC LIMIT ? OFFSET ?`, [
                ...values,
                options.pageSize,
                (options.page - 1) * options.pageSize
            ]);
            return {
                data,
                pagination: {
                    page: options.page,
                    pageSize: options.pageSize,
                    total: Number(count.total),
                    totalPages: Math.ceil(Number(count.total) / options.pageSize)
                }
            };
        },
        async get (recordId, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])(), lock = false) {
            if (lock) {
                const [rows] = await db.execute(`SELECT ${primary} FROM ${entity} WHERE ${primary} = ? FOR UPDATE`, [
                    recordId
                ]);
                if (!rows.length) return null;
            }
            const [rows] = await db.execute(`SELECT ${columns} FROM ${from} WHERE ${alias}.${primary} = ?`, [
                recordId
            ]);
            return rows[0] || null;
        },
        async create (data, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])()) {
            const keys = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fields"][entity].filter((key)=>Object.hasOwn(data, key));
            // LAST_INSERT_ID is read as a string to preserve BIGINT precision.
            const owned = typeof db.getConnection === "function";
            const connection = owned ? await db.getConnection() : db;
            try {
                await connection.execute(`INSERT INTO ${entity} (${keys.join(", ")}) VALUES (${keys.map(()=>"?").join(", ")})`, keys.map((key)=>data[key]));
                const [[row]] = await connection.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
                return row.id;
            } finally{
                if (owned) connection.release();
            }
        },
        async update (recordId, data, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])()) {
            const keys = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fields"][entity].filter((key)=>Object.hasOwn(data, key));
            await db.execute(`UPDATE ${entity} SET ${keys.map((key)=>`${key} = ?`).join(", ")} WHERE ${primary} = ?`, [
                ...keys.map((key)=>data[key]),
                recordId
            ]);
        },
        async delete (recordId, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])()) {
            await db.execute(`DELETE FROM ${entity} WHERE ${primary} = ?`, [
                recordId
            ]);
        },
        async isReferenced (recordId, db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])()) {
            for (const [table, column] of dependencies){
                const [rows] = await db.execute(`SELECT ${column} FROM ${table} WHERE ${column} = ? LIMIT 1 FOR UPDATE`, [
                    recordId
                ]);
                if (rows.length) return true;
            }
            return false;
        }
    };
}
async function referenceExists(table, recordId, db) {
    const keys = {
        transplant_centre: "centre_id",
        donor: "donor_id",
        organ_type: "organ_type_id"
    };
    if (!keys[table]) throw new Error("Unsupported reference.");
    const [rows] = await db.execute(`SELECT ${keys[table]} FROM ${table} WHERE ${keys[table]} = ? FOR SHARE`, [
        recordId
    ]);
    return rows.length > 0;
}
async function getReferenceData(db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])()) {
    const [centres] = await db.query("SELECT centre_id, centre_name, is_active FROM transplant_centre ORDER BY centre_name");
    const [organTypes] = await db.query("SELECT organ_type_id, organ_name, is_active FROM organ_type ORDER BY organ_name");
    return {
        centres,
        organTypes
    };
}
}),
"[project]/src/lib/services/organ.service.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "organService",
    ()=>organService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$repositories$2f$organ$2e$repository$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/repositories/organ.repository.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$record$2e$service$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/services/record.service.js [app-route] (ecmascript)");
;
;
const organService = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$services$2f$record$2e$service$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRecordService"])("organ", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$repositories$2f$organ$2e$repository$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["organRepository"]);
}),
"[project]/src/lib/services/record.service.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRecordService",
    ()=>createRecordService,
    "withTransaction",
    ()=>withTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/mysql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$repositories$2f$record$2e$repository$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/repositories/record.repository.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$outbox$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync/outbox.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-route] (ecmascript)");
;
;
;
;
async function withTransaction(work) {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$mysql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMysqlPool"])().getConnection();
    try {
        await db.beginTransaction();
        const result = await work(db);
        await db.commit();
        return result;
    } catch (error) {
        await db.rollback();
        throw error;
    } finally{
        db.release();
    }
}
function createRecordService(entity, repository, transaction = withTransaction) {
    const missing = ()=>{
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](404, "NOT_FOUND", "Record not found.");
    };
    async function references(data, db) {
        for (const [field, table] of [
            [
                "centre_id",
                "transplant_centre"
            ],
            [
                "donor_id",
                "donor"
            ],
            [
                "organ_type_id",
                "organ_type"
            ]
        ]){
            if (Object.hasOwn(data, field) && !await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$repositories$2f$record$2e$repository$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["referenceExists"])(table, data[field], db)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"](400, "INVALID_REFERENCE", `${field} does not reference an existing record.`);
        }
    }
    return {
        list: (query, db)=>repository.list((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listOptions"])(entity, query), db),
        async get (value, db) {
            const row = await repository.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["id"])(value), db);
            if (!row) missing();
            return row;
        },
        async create (input) {
            const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateRecord"])(entity, input);
            return transaction(async (db)=>{
                await references(data, db);
                const recordId = await repository.create(data, db);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$outbox$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordMutation"])(db, entity, recordId, "CREATED");
                return repository.get(recordId, db);
            });
        },
        async update (value, input) {
            const recordId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["id"])(value), data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateRecord"])(entity, input, true);
            return transaction(async (db)=>{
                const existing = await repository.get(recordId, db, true);
                if (!existing) missing();
                // Preserve historical organ identity once any workflow references exist.
                if (entity === "organ" && (existing.organ_status !== "AVAILABLE" || await repository.isReferenced(recordId, db))) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Only AVAILABLE organs without workflow references can be edited here.");
                // Blood group changes must not silently invalidate downstream assessments.
                if (entity !== "organ" && data.blood_group && data.blood_group !== existing.blood_group && await repository.isReferenced(recordId, db)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Blood group cannot change while dependent records exist.");
                await references(data, db);
                await repository.update(recordId, data, db);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$outbox$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordMutation"])(db, entity, recordId, "UPDATED");
                return repository.get(recordId, db);
            });
        },
        async delete (value) {
            const recordId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["id"])(value);
            return transaction(async (db)=>{
                const existing = await repository.get(recordId, db, true);
                if (!existing) missing();
                if (entity === "organ" && existing.organ_status !== "AVAILABLE") (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("Only AVAILABLE organs without workflow references may be deleted.");
                if (await repository.isReferenced(recordId, db)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["conflict"])("This record has dependent records and cannot be deleted.");
                await repository.delete(recordId, db);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2f$outbox$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordMutation"])(db, entity, recordId, "DELETED");
                return {
                    [`${entity}_id`]: recordId,
                    deleted: true
                };
            });
        }
    };
}
}),
"[project]/src/lib/sync/outbox.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Metadata only: no names, dates of birth, contact details, or credentials.
__turbopack_context__.s([
    "recordMutation",
    ()=>recordMutation
]);
async function recordMutation(db, entity, recordId, action) {
    await db.execute("INSERT INTO audit_log (user_id, entity_name, entity_id, action) VALUES (NULL, ?, ?, ?)", [
        entity,
        recordId,
        action
    ]);
    await db.execute("INSERT INTO sync_outbox (aggregate_type, aggregate_id, event_type, payload) VALUES (?, ?, ?, ?)", [
        entity,
        recordId,
        `${entity.toUpperCase()}_${action}`,
        JSON.stringify({
            [`${entity}_id`]: recordId,
            action
        })
    ]);
}
}),
"[project]/src/lib/validation/records.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "BLOOD_GROUPS",
    ()=>BLOOD_GROUPS,
    "DONOR_TYPES",
    ()=>DONOR_TYPES,
    "ORGAN_STATUSES",
    ()=>ORGAN_STATUSES,
    "SEXES",
    ()=>SEXES,
    "calendarDate",
    ()=>calendarDate,
    "conflict",
    ()=>conflict,
    "fields",
    ()=>fields,
    "id",
    ()=>id,
    "invalid",
    ()=>invalid,
    "listOptions",
    ()=>listOptions,
    "validateRecord",
    ()=>validateRecord
]);
const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
];
const DONOR_TYPES = [
    "LIVING",
    "DECEASED"
];
const SEXES = [
    "FEMALE",
    "MALE",
    "OTHER",
    "UNDISCLOSED"
];
const ORGAN_STATUSES = [
    "AVAILABLE",
    "RESERVED",
    "TRANSPLANTED",
    "DISCARDED"
];
class AppError extends Error {
    constructor(status, code, message){
        super(message);
        this.status = status;
        this.code = code;
    }
}
const invalid = (message)=>{
    throw new AppError(400, "INVALID_INPUT", message);
};
const conflict = (message)=>{
    throw new AppError(409, "CONFLICT", message);
};
function id(value, field = "id", max = 18446744073709551615n) {
    if (typeof value !== "string" && typeof value !== "number" || typeof value === "number" && !Number.isSafeInteger(value) || !/^[1-9]\d{0,19}$/.test(String(value)) || BigInt(value) > max) invalid(`${field} must be a positive integer ID.`);
    return String(value);
}
function text(value, field, length, optional = false) {
    if (optional && (value === null || value === "")) return null;
    if (typeof value !== "string" || !value.trim() || [
        ...value.trim()
    ].length > length || /[\x00-\x1f\x7f]/.test(value)) invalid(`${field} must contain 1–${length} characters.`);
    return value.trim();
}
function enumeration(value, field, values) {
    if (!values.includes(value)) invalid(`${field} must be one of: ${values.join(", ")}.`);
    return value;
}
function calendarDate(value, field = "date_of_birth", now = new Date()) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid(`${field} must use YYYY-MM-DD.`);
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < "1900-01-01" || value > now.toISOString().slice(0, 10)) invalid(`${field} must be a valid date between 1900-01-01 and today.`);
    return value;
}
function retrievedAt(value) {
    if (value === null || value === "") return null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z?$/.test(value)) invalid("retrieved_at must be a UTC date/time (YYYY-MM-DDTHH:mm:ssZ).");
    calendarDate(value.slice(0, 10), "retrieved_at");
    const normalized = value.replace(/Z$/, "");
    const full = normalized.length === 16 ? `${normalized}:00` : normalized;
    const parsed = new Date(`${full}Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 19) !== full || parsed > new Date()) invalid("retrieved_at must be a valid UTC time, not in the future.");
    return full.replace("T", " ");
}
const fields = {
    donor: [
        "centre_id",
        "full_name",
        "date_of_birth",
        "blood_group",
        "donor_type",
        "contact_phone"
    ],
    patient: [
        "centre_id",
        "full_name",
        "date_of_birth",
        "sex",
        "blood_group",
        "contact_phone",
        "city"
    ],
    organ: [
        "donor_id",
        "organ_type_id",
        "centre_id",
        "organ_status",
        "retrieved_at"
    ]
};
function validateRecord(entity, input, partial = false) {
    if (!input || typeof input !== "object" || Array.isArray(input)) invalid("A JSON object is required.");
    const allowed = fields[entity];
    if (!Object.keys(input).length || Object.keys(input).some((key)=>!allowed.includes(key))) invalid("Empty request or unsupported fields.");
    const required = entity === "organ" ? [
        "donor_id",
        "organ_type_id",
        "centre_id"
    ] : [
        "centre_id",
        "full_name",
        "date_of_birth",
        "blood_group",
        entity === "donor" ? "donor_type" : "sex"
    ];
    if (!partial && required.some((key)=>!Object.hasOwn(input, key))) invalid(`Required fields: ${required.join(", ")}.`);
    const result = {};
    for (const [key, value] of Object.entries(input)){
        if (key.endsWith("_id")) result[key] = id(value, key, key === "organ_type_id" ? 65535n : undefined);
        else if (key === "full_name") result[key] = text(value, key, 120);
        else if (key === "city") result[key] = text(value, key, 100, true);
        else if (key === "contact_phone") result[key] = text(value, key, 20, true);
        else if (key === "date_of_birth") result[key] = calendarDate(value);
        else if (key === "blood_group") result[key] = enumeration(value, key, BLOOD_GROUPS);
        else if (key === "donor_type") result[key] = enumeration(value, key, DONOR_TYPES);
        else if (key === "sex") result[key] = enumeration(value, key, SEXES);
        else if (key === "retrieved_at") result[key] = retrievedAt(value);
        else if (key === "organ_status") result[key] = enumeration(value, key, ORGAN_STATUSES);
    }
    if (entity === "organ" && Object.hasOwn(result, "organ_status")) {
        if (partial || result.organ_status !== "AVAILABLE") conflict("Organ status is controlled by matching, allocation, and transplant workflows. New organs must be AVAILABLE.");
    }
    if (!partial) {
        if (entity === "organ") {
            result.organ_status = "AVAILABLE";
            result.retrieved_at ??= null;
        } else {
            result.contact_phone ??= null;
            if (entity === "patient") result.city ??= null;
        }
    }
    return result;
}
function listOptions(entity, input = {}) {
    const allowed = [
        "page",
        "pageSize",
        "search",
        "centre_id",
        ...entity === "organ" ? [
            "organ_status",
            "organ_type_id",
            "donor_id"
        ] : [
            "blood_group",
            entity === "donor" ? "donor_type" : "sex"
        ]
    ];
    if (Object.keys(input).some((key)=>!allowed.includes(key))) invalid("Unsupported query parameter.");
    const integer = (value, fallback, max)=>{
        if (value === undefined) return fallback;
        if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) > max) invalid("Invalid pagination. pageSize must be 1–100; page must be 1–1000000.");
        return Number(value);
    };
    const result = {
        page: integer(input.page, 1, 1000000),
        pageSize: integer(input.pageSize, 10, 100),
        search: ""
    };
    if (input.search !== undefined) {
        if (typeof input.search !== "string" || input.search.length > 120) invalid("Search must be at most 120 characters.");
        result.search = input.search.trim();
    }
    for (const key of allowed.filter((k)=>![
            "page",
            "pageSize",
            "search"
        ].includes(k))){
        if (input[key] === undefined || input[key] === "") continue;
        if (key.endsWith("_id")) result[key] = id(input[key], key, key === "organ_type_id" ? 65535n : undefined);
        else result[key] = enumeration(input[key], key, key === "blood_group" ? BLOOD_GROUPS : key === "donor_type" ? DONOR_TYPES : key === "sex" ? SEXES : ORGAN_STATUSES);
    }
    return result;
}
}),
]})(),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c_8pod6cpj0g._.js.map