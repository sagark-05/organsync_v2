# OrganSync V2 — Phase 3C completion report

Implemented donor, patient, and organ CRUD using the existing repository → service → route architecture and existing MySQL schema. No migrations, existing documentation, seed files, or existing demo records were changed. No dependencies were added. Phase 3D was not started.

## Modified files

- [package.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/package.json)
- [.env.example](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.env.example)
- [src/lib/db/mysql.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/db/mysql.js)
- [src/lib/repositories/donor.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/donor.repository.js)
- [src/lib/repositories/patient.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/patient.repository.js)
- [src/lib/repositories/organ.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/organ.repository.js)
- [src/lib/services/donor.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/donor.service.js)
- [src/lib/sync/outbox.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/sync/outbox.js)
- [src/app/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/page.jsx)
- [src/app/globals.css](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/globals.css)

## Created files

- [src/lib/validation/records.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/validation/records.js)
- [src/lib/repositories/record.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/record.repository.js)
- [src/lib/services/record.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/record.service.js)
- [src/lib/services/patient.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/patient.service.js)
- [src/lib/services/organ.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/organ.service.js)
- [src/lib/auth/development.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/auth/development.js)
- [src/lib/api/records.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/api/records.js)
- [src/app/api/reference-data/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/reference-data/route.js)
- [src/app/api/donors/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/donors/route.js)
- [src/app/api/donors/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/donors/[id]/route.js)
- [src/app/donors/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/donors/page.jsx)
- [src/app/api/patients/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/patients/route.js)
- [src/app/api/patients/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/patients/[id]/route.js)
- [src/app/patients/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/patients/page.jsx)
- [src/app/api/organs/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/organs/route.js)
- [src/app/api/organs/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/organs/[id]/route.js)
- [src/app/organs/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/organs/page.jsx)
- [src/components/forms/RecordForm.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/forms/RecordForm.jsx)
- [src/components/tables/RecordsTable.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/tables/RecordsTable.jsx)
- [src/components/layout/ManagementPage.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/ManagementPage.jsx)
- [tests/unit/records.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/unit/records.test.js)
- [tests/integration/crud.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/integration/crud.test.js)
- [PHASE3C-REPORT.md](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/PHASE3C-REPORT.md)

## API endpoints

| Endpoint | Methods |
| --- | --- |
| /api/donors | GET, POST |
| /api/donors/[id] | GET, PATCH, DELETE |
| /api/patients | GET, POST |
| /api/patients/[id] | GET, PATCH, DELETE |
| /api/organs | GET, POST |
| /api/organs/[id] | GET, PATCH, DELETE (only AVAILABLE, unreferenced records) |
| /api/reference-data | GET |

All routes use Node.js and no-store responses. Lists return success, data, and pagination; other successes return success and data. Failures return success:false and a sanitized error with code and message. Write protection returns HTTP 403. Validation, missing records, constraints, and unexpected failures return 400, 404, 409, and 500 respectively.

List parameters: page, pageSize (1–100), search, centre_id; donor lists also accept blood_group and donor_type; patient lists also accept blood_group and sex; organ lists also accept organ_status, organ_type_id, and donor_id. Search uses parameterized literal substring matching, not user-provided SQL or wildcard syntax.

## Frontend

/donors, /patients, and /organs have responsive listing tables, search, centre and blood-group/status filtering, pagination, API-fetched details, add/edit forms, deletion confirmation, and loading/empty/success/error states. The organ form supports donor search and organ-type/centre selection. Homepage links open the three registries. Forms are disabled while the server is read-only. Matching, allocation, and transplant status transitions cannot be made through CRUD. Referenced organs cannot be edited or deleted; blood-group changes on referenced people are rejected.

## Tables accessed

Application reads: donor, patient, organ, transplant_centre, organ_type, waiting_list, medical_record, organ_match, active_organ_reservation, organ_transplant_record.

Application writes: donor, patient, organ, audit_log, sync_outbox. CRUD writes, audit entries, and outbox events share one transaction. Development audit user_id is NULL because no authenticated identity exists. Outbox payloads contain only record IDs and action metadata; no names, birth dates, contact data, or credentials.

The integration test additionally inserted and removed fictional waiting_list and organ_match fixtures within its rolled-back transaction. Schema inspection used read-only information_schema queries.

## Validation results

- npm ls --depth=0: all required dependencies installed. Two pre-existing extraneous packages were left untouched.
- node --check across src/lib, src/app/api, and test JavaScript files: passed.
- npm test: 12 tests passed. Covers validation, dates, BIGINT IDs, pagination, SQL parameter binding, workflow protections, development-write guards, sanitized errors, dynamic route parameters, JSON body parsing/limits, and commit/rollback behavior.
- npm run test:integration: passed against actual MySQL. POST/PATCH/DELETE API handlers and services used fictional fixtures on one injected connection with an outer transaction that always rolls back. Verified foreign-key validation, dependent-record deletion protection, organ workflow protection, audit/outbox writes, and fixture cleanup. Final donor/patient/organ/audit/outbox counts matched their pre-test values. Rolled-back inserts can consume auto-increment numbers; no counter was reset.
- npm run build: final production build passed. The sandbox intermittently rejected generated .next directory writes with EPERM; running the same command outside the sandbox passed.
- Live HTTP smoke checks: all three pages and list/detail endpoints returned 200; invalid pagination returned 400; valid but absent IDs returned 404; tokenless POST/PATCH/DELETE returned 403.
- Live /api/health: HTTP 200, status ok, mysql connected, 4 donors, 4 patients, 5 organs.
- Browser review: actual records, joined organ/donor/type/centre names, details, search, empty results, filtering, navigation, and mobile table scrolling checked. Live browser write submissions and a full browser form-write round trip were not executed because the running application remains read-only. Write handler/database round trips were tested using rollback fixtures instead. Pagination backend behavior was tested; the current four/five-row live lists fit on one UI page.

## Local development write setup and remaining authorization

Production authentication, login, and role-based authorization are pending. All production writes are blocked, even if development settings are supplied. GET endpoints currently expose fictional demonstration records without authentication; this is not ready for real personal data or public production deployment.

To enable local fictional-data writes, configure the existing ignored .env.local with ORGANSYNC_DEV_WRITES=true and ORGANSYNC_DEV_WRITE_TOKEN set to a random secret of at least 32 characters; restart npm run dev and enter that token in a registry page. Requests must use a localhost/loopback URL and, when an Origin header is present, it must match. The token is never sent by the server to the browser, embedded in a NEXT_PUBLIC variable, or persisted in browser storage. It is supplied as a Bearer token in write requests.

The .env.local file was not changed during this implementation. The integration test's development settings were confined to its own process and restored afterward.

## Existing documentation differences and deferred work

The existing business rules describe audit and synchronization events for allocation/transplant procedures, but 006_procedures.sql currently inserts only sync_outbox events for those operations. Neither the SQL nor documentation was changed. New Phase 3C CRUD transactions write both audit_log and sync_outbox.

The existing SQL concepts documentation lists database/queries/crud.sql, which is absent from the workspace; no substitute SQL script was invented.

MongoDB delivery, projections, retry processing, and the background worker remain deferred to the documented MongoDB integration phase. Phase 3C produces transactional metadata events in the existing outbox, while MySQL remains authoritative. No MongoDB connectivity or synchronization success is claimed.

No known compilation errors remain. Production authorization, MongoDB delivery, browser write-flow validation, and later transplant workflows remain unfinished as described above.
