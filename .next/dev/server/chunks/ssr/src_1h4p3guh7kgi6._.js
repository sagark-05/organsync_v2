(()=>{"use strict";module.exports = [
"[project]/src/components/forms/RecordForm.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecordForm,
    "labels",
    ()=>labels,
    "recordFields",
    ()=>recordFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const labels = {
    donor_id: "Donor ID",
    patient_id: "Patient ID",
    organ_id: "Organ ID",
    centre_id: "Transplant centre",
    full_name: "Full name",
    date_of_birth: "Date of birth",
    blood_group: "Blood group",
    donor_type: "Donor type",
    contact_phone: "Contact phone",
    sex: "Sex",
    city: "City",
    organ_type_id: "Organ type",
    organ_status: "Organ status",
    retrieved_at: "Retrieved at (UTC)",
    donor_name: "Donor",
    organ_name: "Organ type",
    centre_name: "Centre",
    registered_at: "Registered at",
    created_at: "Created at"
};
function recordFields(entity) {
    return entity === "organ" ? [
        "donor_id",
        "organ_type_id",
        "centre_id",
        "retrieved_at"
    ] : [
        "full_name",
        "centre_id",
        "date_of_birth",
        "blood_group",
        entity === "donor" ? "donor_type" : "sex",
        "contact_phone",
        ...entity === "patient" ? [
            "city"
        ] : []
    ];
}
function DonorPicker({ value, onChange, disabled, currentName }) {
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [options, setOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        const timer = setTimeout(async ()=>{
            try {
                const response = await fetch(`/api/donors?${new URLSearchParams({
                    search,
                    pageSize: "20"
                })}`, {
                    signal: controller.signal
                });
                const body = await response.json();
                if (!response.ok) throw new Error(body.error?.message || "Could not load donors.");
                setOptions(body.data);
                setError("");
            } catch (e) {
                if (!controller.signal.aborted) setError(e.message);
            }
        }, 250);
        return ()=>{
            clearTimeout(timer);
            controller.abort();
        };
    }, [
        search
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "donor-picker",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "donor-search",
                children: [
                    "Find a donor by name",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "donor-search",
                        value: search,
                        disabled: disabled,
                        onChange: (e)=>setSearch(e.target.value),
                        placeholder: "Search donors…"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 31,
                        columnNumber: 90
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 40
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "record-donor_id",
                children: [
                    "Donor",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        id: "record-donor_id",
                        required: true,
                        disabled: disabled,
                        value: value,
                        onChange: (e)=>onChange(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Select a donor"
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 31,
                                columnNumber: 382
                            }, this),
                            value && !options.some((row)=>String(row.donor_id) === String(value)) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: [
                                    currentName || "Selected donor",
                                    " (#",
                                    value,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 31,
                                columnNumber: 496
                            }, this),
                            options.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: row.donor_id,
                                    children: [
                                        row.full_name,
                                        " (#",
                                        row.donor_id,
                                        ")"
                                    ]
                                }, row.donor_id, true, {
                                    fileName: "[project]/src/components/forms/RecordForm.jsx",
                                    lineNumber: 31,
                                    columnNumber: 592
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 31,
                        columnNumber: 269
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 231
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                children: "Search narrows the first 20 results."
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 701
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 762
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/RecordForm.jsx",
        lineNumber: 31,
        columnNumber: 10
    }, this);
}
function RecordForm({ entity, record, references, disabled, busy, onSave, onCancel }) {
    const keys = recordFields(entity);
    const [values, setValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Object.fromEntries(keys.map((key)=>[
                key,
                key === "retrieved_at" ? (record?.[key] || "").slice(0, 19) : record?.[key] ?? ""
            ])));
    const set = (key, value)=>setValues((previous)=>({
                ...previous,
                [key]: value
            }));
    function submit(event) {
        event.preventDefault();
        const data = Object.fromEntries(keys.map((key)=>[
                key,
                values[key] === "" && [
                    "contact_phone",
                    "city",
                    "retrieved_at"
                ].includes(key) ? null : values[key]
            ]));
        // PATCH sends changed fields only, preserving untouched dates and references.
        if (record) {
            for (const key of keys){
                const old = key === "retrieved_at" ? (record[key] || "").slice(0, 19) : record[key] ?? "";
                if (String(values[key]) === String(old)) delete data[key];
            }
        }
        onSave(data);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "record-form",
        onSubmit: submit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "form-grid",
                children: keys.map((key)=>{
                    if (key === "donor_id") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DonorPicker, {
                        value: values[key],
                        onChange: (value)=>set(key, value),
                        disabled: disabled || busy,
                        currentName: record?.donor_name
                    }, key, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 52,
                        columnNumber: 38
                    }, this);
                    let options;
                    if (key === "centre_id") options = references.centres.map((row)=>[
                            row.centre_id,
                            `${row.centre_name}${row.is_active ? "" : " (inactive)"}`
                        ]);
                    if (key === "organ_type_id") options = references.organTypes.map((row)=>[
                            row.organ_type_id,
                            `${row.organ_name}${row.is_active ? "" : " (inactive)"}`
                        ]);
                    if (key === "blood_group") options = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BLOOD_GROUPS"].map((value)=>[
                            value,
                            value
                        ]);
                    if (key === "donor_type") options = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DONOR_TYPES"].map((value)=>[
                            value,
                            value
                        ]);
                    if (key === "sex") options = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SEXES"].map((value)=>[
                            value,
                            value
                        ]);
                    const optional = [
                        "city",
                        "contact_phone",
                        "retrieved_at"
                    ].includes(key);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: `record-${key}`,
                        children: [
                            labels[key],
                            optional ? " (optional)" : " *",
                            options ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: `record-${key}`,
                                value: values[key],
                                required: true,
                                disabled: disabled || busy,
                                onChange: (e)=>set(key, e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Select…"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                                        lineNumber: 60,
                                        columnNumber: 241
                                    }, this),
                                    options.map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: value,
                                            children: label
                                        }, value, false, {
                                            fileName: "[project]/src/components/forms/RecordForm.jsx",
                                            lineNumber: 60,
                                            columnNumber: 307
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 60,
                                columnNumber: 114
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: `record-${key}`,
                                type: key === "date_of_birth" ? "date" : key === "retrieved_at" ? "datetime-local" : key === "contact_phone" ? "tel" : "text",
                                step: key === "retrieved_at" ? "1" : undefined,
                                min: key === "date_of_birth" ? "1900-01-01" : undefined,
                                max: key === "date_of_birth" ? new Date().toISOString().slice(0, 10) : undefined,
                                maxLength: key === "full_name" ? 120 : key === "city" ? 100 : key === "contact_phone" ? 20 : undefined,
                                required: !optional,
                                value: values[key],
                                disabled: disabled || busy,
                                onChange: (e)=>set(key, e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 60,
                                columnNumber: 371
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 60,
                        columnNumber: 14
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 51,
                columnNumber: 5
            }, this),
            entity === "organ" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "note",
                children: "New organs start as AVAILABLE. Status transitions belong to the matching, allocation, and transplant workflows. Times are entered in UTC."
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 62,
                columnNumber: 28
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "actions",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        className: "button",
                        disabled: disabled || busy,
                        children: busy ? "Saving…" : record ? "Save changes" : "Create record"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 63,
                        columnNumber: 30
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        disabled: busy,
                        children: "Cancel"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 63,
                        columnNumber: 170
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 63,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/RecordForm.jsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/components/layout/ManagementPage.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ManagementPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/RecordForm.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$tables$2f$RecordsTable$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/tables/RecordsTable.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
async function api(url, options = {}) {
    const response = await fetch(url, {
        cache: "no-store",
        ...options
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "The request failed. Please try again.");
    return body;
}
function ManagementPage({ entity }) {
    const plural = `${entity}s`, title = plural[0].toUpperCase() + plural.slice(1);
    const [references, setReferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        centres: [],
        organTypes: [],
        developmentWritesEnabled: false
    });
    const [referenceError, setReferenceError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        data: [],
        pagination: {
            page: 1,
            total: 0,
            totalPages: 0
        }
    });
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        search: "",
        centre_id: "",
        filter: "",
        page: 1
    });
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [refresh, setRefresh] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true), [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""), [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selection, setSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const dialog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null), panel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canWrite = references.developmentWritesEnabled && token.length >= 32;
    const filterKey = entity === "organ" ? "organ_status" : "blood_group";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        api("/api/reference-data", {
            signal: controller.signal
        }).then((body)=>{
            setReferences(body.data);
            setReferenceError("");
        }).catch((e)=>{
            if (!controller.signal.aborted) setReferenceError(e.message);
        });
        return ()=>controller.abort();
    }, [
        refresh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const controller = new AbortController();
        setLoading(true);
        setError("");
        const params = new URLSearchParams({
            page: String(query.page),
            pageSize: "10",
            search: query.search
        });
        if (query.centre_id) params.set("centre_id", query.centre_id);
        if (query.filter) params.set(filterKey, query.filter);
        api(`/api/${plural}?${params}`, {
            signal: controller.signal
        }).then((body)=>{
            if (query.page > Math.max(1, body.pagination.totalPages)) {
                setQuery((previous)=>({
                        ...previous,
                        page: Math.max(1, body.pagination.totalPages)
                    }));
                return;
            }
            setResult(body);
        }).catch((e)=>{
            if (!controller.signal.aborted) {
                setError(e.message);
                setResult({
                    data: [],
                    pagination: {
                        page: query.page,
                        total: 0,
                        totalPages: 0
                    }
                });
            }
        }).finally(()=>{
            if (!controller.signal.aborted) setLoading(false);
        });
        return ()=>controller.abort();
    }, [
        entity,
        plural,
        filterKey,
        query,
        refresh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selection?.mode === "delete") dialog.current?.showModal();
        else if (selection) panel.current?.focus();
    }, [
        selection
    ]);
    async function action(mode, record) {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const body = await api(`/api/${plural}/${record[`${entity}_id`]}`);
            setSelection({
                mode,
                record: body.data
            });
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    async function mutate(method, data) {
        if (method === "PATCH" && !Object.keys(data).length) {
            setMessage("No changes to save.");
            return;
        }
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const recordId = selection?.record?.[`${entity}_id`];
            await api(`/api/${plural}${method === "POST" ? "" : `/${recordId}`}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                ...method === "DELETE" ? {} : {
                    body: JSON.stringify(data)
                }
            });
            setMessage(method === "DELETE" ? "Record deleted." : method === "POST" ? "Record created." : "Record updated.");
            setSelection(null);
            setRefresh((value)=>value + 1);
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    const filterValues = entity === "organ" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ORGAN_STATUSES"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BLOOD_GROUPS"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "shell management",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        className: "brand",
                        href: "/",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mark",
                                "aria-hidden": "true",
                                children: "+"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 71,
                                columnNumber: 46
                            }, this),
                            "OrganSync ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: "V2"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 71,
                                columnNumber: 106
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        "aria-label": "Management",
                        children: [
                            "donors",
                            "patients",
                            "organs"
                        ].map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: `/${name}`,
                                "aria-current": plural === name ? "page" : undefined,
                                children: name[0].toUpperCase() + name.slice(1)
                            }, name, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 71,
                                columnNumber: 205
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 71,
                        columnNumber: 130
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                lineNumber: 71,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "management-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: "REGISTRY MANAGEMENT"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 73,
                                        columnNumber: 48
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 73,
                                        columnNumber: 94
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Manage fictional demonstration records. This educational system is not for clinical decisions."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 73,
                                        columnNumber: 110
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 73,
                                columnNumber: 43
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "button",
                                disabled: !canWrite || busy || loading,
                                onClick: ()=>{
                                    setSelection({
                                        mode: "create",
                                        record: null
                                    });
                                    setError("");
                                    setMessage("");
                                },
                                children: [
                                    "Add ",
                                    entity
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 73,
                                columnNumber: 217
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 73,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "write-notice",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: references.developmentWritesEnabled ? "Local development writes enabled" : "Read-only mode"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 74,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Production authentication and role-based authorization are pending. ",
                                    references.developmentWritesEnabled ? "Enter your development token to enable forms. It stays in this page’s memory." : "Writes require an explicit local development setting and a server-configured token."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 74,
                                columnNumber: 149
                            }, this),
                            references.developmentWritesEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "development-token",
                                children: [
                                    "Development token",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "development-token",
                                        type: "password",
                                        autoComplete: "off",
                                        value: token,
                                        onChange: (e)=>setToken(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 74,
                                        columnNumber: 523
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 74,
                                columnNumber: 471
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 74,
                        columnNumber: 7
                    }, this),
                    referenceError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "feedback error",
                        role: "alert",
                        children: [
                            "Reference data: ",
                            referenceError
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 75,
                        columnNumber: 26
                    }, this),
                    error && selection?.mode !== "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "feedback error",
                        role: "alert",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 76,
                        columnNumber: 49
                    }, this),
                    message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "feedback success",
                        role: "status",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 77,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        className: "filters",
                        onSubmit: (event)=>{
                            event.preventDefault();
                            setQuery((previous)=>({
                                    ...previous,
                                    search,
                                    page: 1
                                }));
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "search-records",
                                children: [
                                    "Search",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "search-records",
                                        type: "search",
                                        maxLength: 120,
                                        placeholder: entity === "organ" ? "Donor, organ type or centre" : "Name or centre",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 79,
                                        columnNumber: 47
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 79,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "filter-centre",
                                children: [
                                    "Centre",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "filter-centre",
                                        value: query.centre_id,
                                        onChange: (e)=>setQuery((previous)=>({
                                                    ...previous,
                                                    centre_id: e.target.value,
                                                    page: 1
                                                })),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "All centres"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 80,
                                                columnNumber: 189
                                            }, this),
                                            references.centres.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: row.centre_id,
                                                    children: row.centre_name
                                                }, row.centre_id, false, {
                                                    fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                    lineNumber: 80,
                                                    columnNumber: 257
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 80,
                                        columnNumber: 46
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 80,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "filter-records",
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["labels"][filterKey],
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "filter-records",
                                        value: query.filter,
                                        onChange: (e)=>setQuery((previous)=>({
                                                    ...previous,
                                                    filter: e.target.value,
                                                    page: 1
                                                })),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "All"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 81,
                                                columnNumber: 198
                                            }, this),
                                            filterValues.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    children: value
                                                }, value, false, {
                                                    fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                    lineNumber: 81,
                                                    columnNumber: 254
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 81,
                                        columnNumber: 60
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 81,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "button",
                                children: "Search"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 82,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setSearch("");
                                    setQuery({
                                        search: "",
                                        centre_id: "",
                                        filter: "",
                                        page: 1
                                    });
                                },
                                children: "Clear"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 82,
                                columnNumber: 65
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: loading,
                                onClick: ()=>setRefresh((value)=>value + 1),
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 82,
                                columnNumber: 198
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 78,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-label": `${title} listing`,
                        "aria-busy": loading,
                        children: [
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "empty",
                                children: [
                                    "Loading ",
                                    plural,
                                    "…"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 85,
                                columnNumber: 20
                            }, this) : !error && !result.data.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "empty",
                                children: "No records found. Try a different search or filter."
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 85,
                                columnNumber: 111
                            }, this) : result.data.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$tables$2f$RecordsTable$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                entity: entity,
                                records: result.data,
                                busy: busy,
                                canWrite: canWrite,
                                onAction: action
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 85,
                                columnNumber: 216
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pagination",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            result.pagination.total,
                                            " records · Page ",
                                            query.page,
                                            " of ",
                                            Math.max(1, result.pagination.totalPages)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 86,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: loading || query.page <= 1,
                                                onClick: ()=>setQuery((previous)=>({
                                                            ...previous,
                                                            page: previous.page - 1
                                                        })),
                                                children: "Previous"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 86,
                                                columnNumber: 175
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: loading || query.page >= result.pagination.totalPages,
                                                onClick: ()=>setQuery((previous)=>({
                                                            ...previous,
                                                            page: previous.page + 1
                                                        })),
                                                children: "Next"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 86,
                                                columnNumber: 319
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 86,
                                        columnNumber: 150
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 86,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 84,
                        columnNumber: 7
                    }, this),
                    selection && selection.mode !== "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "record-panel",
                        ref: panel,
                        tabIndex: -1,
                        "aria-labelledby": "record-panel-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "record-panel-heading",
                                children: selection.mode === "details" ? "Record details" : selection.mode === "create" ? `Add ${entity}` : `Edit ${entity}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 88,
                                columnNumber: 151
                            }, this),
                            selection.mode === "details" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                        className: "record-details",
                                        children: Object.entries(selection.record).map(([key, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["labels"][key] || key
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                        lineNumber: 88,
                                                        columnNumber: 438
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        children: value === null ? "—" : String(value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                        lineNumber: 88,
                                                        columnNumber: 467
                                                    }, this)
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 88,
                                                columnNumber: 423
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 88,
                                        columnNumber: 336
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelection(null),
                                        children: "Close details"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 88,
                                        columnNumber: 527
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 88,
                                columnNumber: 334
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                entity: entity,
                                record: selection.record,
                                references: references,
                                disabled: !canWrite,
                                busy: busy,
                                onSave: (data)=>mutate(selection.mode === "create" ? "POST" : "PATCH", data),
                                onCancel: ()=>setSelection(null)
                            }, `${selection.mode}-${selection.record?.[`${entity}_id`] || "new"}`, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 88,
                                columnNumber: 598
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 88,
                        columnNumber: 52
                    }, this),
                    selection?.mode === "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
                        ref: dialog,
                        onCancel: (event)=>{
                            if (busy) event.preventDefault();
                            else setSelection(null);
                        },
                        "aria-labelledby": "delete-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "delete-heading",
                                children: [
                                    "Delete this ",
                                    entity,
                                    "?"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 177
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    selection.record.full_name || `${selection.record.organ_name} from ${selection.record.donor_name}`,
                                    " (#",
                                    selection.record[`${entity}_id`],
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 227
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Deletion is permanent. The server will reject deletion if dependent records exist."
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 372
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "alert",
                                className: "feedback error",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 471
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        autoFocus: true,
                                        disabled: busy,
                                        onClick: ()=>{
                                            setSelection(null);
                                            setError("");
                                        },
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 89,
                                        columnNumber: 551
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "danger",
                                        disabled: busy || !canWrite,
                                        onClick: ()=>mutate("DELETE"),
                                        children: busy ? "Deleting…" : "Confirm deletion"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 89,
                                        columnNumber: 654
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 526
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 89,
                        columnNumber: 40
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                lineNumber: 72,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        children: "← Home"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 90,
                        columnNumber: 20
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "OrganSync V2 · Fictional demonstration data only"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 90,
                        columnNumber: 48
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                lineNumber: 90,
                columnNumber: 12
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/ManagementPage.jsx",
        lineNumber: 70,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/components/tables/RecordsTable.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecordsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/RecordForm.jsx [app-ssr] (ecmascript)");
"use client";
;
;
function RecordsTable({ entity, records, busy, canWrite, onAction }) {
    const keys = entity === "organ" ? [
        "organ_id",
        "organ_name",
        "donor_name",
        "centre_name",
        "organ_status"
    ] : [
        `${entity}_id`,
        "full_name",
        "blood_group",
        entity === "donor" ? "donor_type" : "sex",
        "centre_name"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "table-scroll",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
                    className: "sr-only",
                    children: [
                        entity,
                        " records"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                    lineNumber: 6,
                    columnNumber: 47
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            keys.map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["labels"][key]
                                }, key, false, {
                                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                    lineNumber: 6,
                                    columnNumber: 130
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                scope: "col",
                                children: "Actions"
                            }, void 0, false, {
                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                lineNumber: 6,
                                columnNumber: 176
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/tables/RecordsTable.jsx",
                        lineNumber: 6,
                        columnNumber: 109
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                    lineNumber: 6,
                    columnNumber: 102
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: records.map((record)=>{
                        const editable = entity !== "organ" || record.organ_status === "AVAILABLE";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                keys.map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: record[key] ?? "—"
                                    }, key, false, {
                                        fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                        lineNumber: 8,
                                        columnNumber: 62
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "row-actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: busy,
                                                onClick: ()=>onAction("details", record),
                                                children: "Details"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                                lineNumber: 8,
                                                columnNumber: 136
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: busy || !canWrite || !editable,
                                                onClick: ()=>onAction("edit", record),
                                                children: "Edit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                                lineNumber: 8,
                                                columnNumber: 220
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "danger-text",
                                                disabled: busy || !canWrite || !editable,
                                                onClick: ()=>onAction("delete", record),
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                                lineNumber: 8,
                                                columnNumber: 324
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                        lineNumber: 8,
                                        columnNumber: 107
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                    lineNumber: 8,
                                    columnNumber: 103
                                }, this)
                            ]
                        }, record[`${entity}_id`], true, {
                            fileName: "[project]/src/components/tables/RecordsTable.jsx",
                            lineNumber: 8,
                            columnNumber: 12
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                    lineNumber: 6,
                    columnNumber: 217
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/tables/RecordsTable.jsx",
            lineNumber: 6,
            columnNumber: 40
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/tables/RecordsTable.jsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/lib/validation/records.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
];})()

//# sourceMappingURL=src_1h4p3guh7kgi6._.js.map