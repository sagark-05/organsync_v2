# OrganSync V2 — Phase 3D completion report

Implemented waiting-list management, educational candidate matching, controlled match-status transitions, and append-only compatibility-test APIs/UI in the existing workspace and architecture. No database migrations, existing documentation, SQL queries, seed files, or demo records were changed. No dependencies were installed. Phase 3E and MongoDB synchronization were not started.

Compatibility-test entry is implemented but blocked on the current database: there is no active CLINICIAN app_user for performed_by. No user was fabricated and no foreign key was bypassed. History remains readable. The existing development-token guard protects all supported writes, and production writes remain blocked.

## Files modified

- [.gitignore](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.gitignore)
- [package.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/package.json)
- [src/app/globals.css](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/globals.css)
- [src/app/layout.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/layout.jsx)
- [src/app/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/page.jsx)
- [src/components/layout/ManagementPage.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/ManagementPage.jsx)
- [src/lib/repositories/match.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/match.repository.js)
- [src/lib/services/matching.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/matching.service.js)
- [src/lib/sync/outbox.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/sync/outbox.js)

## Files created

- [next.config.mjs](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/next.config.mjs)
- [src/lib/validation/workflows.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/validation/workflows.js)
- [src/lib/repositories/workflow.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/workflow.repository.js)
- [src/lib/repositories/waiting-list.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/waiting-list.repository.js)
- [src/lib/repositories/compatibility.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/compatibility.repository.js)
- [src/lib/services/waiting-list.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/waiting-list.service.js)
- [src/lib/services/compatibility.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/compatibility.service.js)
- [src/lib/api/client.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/api/client.js)
- [src/app/api/waiting-list/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/waiting-list/route.js)
- [src/app/api/waiting-list/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/waiting-list/[id]/route.js)
- [src/app/api/matches/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/matches/route.js)
- [src/app/api/matches/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/matches/[id]/route.js)
- [src/app/api/matches/candidates/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/matches/candidates/route.js)
- [src/app/api/compatibility-tests/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/compatibility-tests/route.js)
- [src/app/api/compatibility-tests/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/compatibility-tests/[id]/route.js)
- [src/app/api/workflow-options/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/workflow-options/route.js)
- [src/app/waiting-list/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/waiting-list/page.jsx)
- [src/app/matching/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/matching/page.jsx)
- [src/components/forms/RecordLookup.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/forms/RecordLookup.jsx)
- [src/components/forms/WorkflowForm.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/forms/WorkflowForm.jsx)
- [src/components/layout/ModuleNavigation.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/ModuleNavigation.jsx)
- [src/components/layout/WorkflowPage.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/WorkflowPage.jsx)
- [src/components/tables/WorkflowTable.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/tables/WorkflowTable.jsx)
- [tests/unit/workflows.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/unit/workflows.test.js)
- [tests/unit/workflow-services.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/unit/workflow-services.test.js)
- [tests/integration/workflows.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/integration/workflows.test.js)
- [PHASE3D-REPORT.md](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/PHASE3D-REPORT.md)

Next.js itself generated AGENTS.md when the dev server started. Generated build artifacts also changed. The existing .next directory is already tracked by Git; no Git index cleanup or unrelated file deletion was performed.

The outbox helper now maps the existing waiting_list, organ_match, and compatibility_test table names to their actual primary keys: waiting_id, match_id, and test_id. Existing Phase 3C event names and payloads remain unchanged. New events follow the same aggregate/action format and carry only IDs and action metadata.

## API endpoints

| Endpoint | Methods | Behavior |
| --- | --- | --- |
| /api/waiting-list | GET, POST | Paginated joined registrations; create ACTIVE registration |
| /api/waiting-list/[id] | GET, PATCH, DELETE | Details; edit/cancel unreferenced ACTIVE registration; safe delete |
| /api/matches | GET, POST | Paginated joined matches/latest evidence; save an explicit organ/registration pair as PROPOSED |
| /api/matches/[id] | GET, PATCH | Details and controlled status transitions; no deletion |
| /api/matches/candidates | GET | Read-only, paginated educational candidate preview |
| /api/compatibility-tests | GET, POST | Paginated immutable history; guarded append when an active clinician exists |
| /api/compatibility-tests/[id] | GET | Test details; no PATCH or DELETE |
| /api/workflow-options | GET | Centres, organ types, active clinician references, development-write availability; no credentials |

Every route uses the Node.js runtime and no-store responses, and reuses the Phase 3C JSON/error helpers. Unsupported history mutations return 405. Supported tokenless or production writes return 403. Invalid inputs, absent records, business/constraint conflicts, and unexpected failures use 400, 404, 409, and sanitized 500 responses.

Waiting-list filters: patient-name search, patient_id, organ_type_id, centre_id, priority_level, status, page, pageSize. Matching filters: patient/donor/organ-type search, organ_id, waiting_id, patient_id, registration centre_id, organ_type_id, match_status, page, pageSize. Candidate preview uses the same matching filters except match_status. Compatibility history supports match_id and pagination. Page size is bounded to 1–100. Centre filtering on the matching page explicitly means the patient's registration centre; both registration and organ centres are displayed.

## Rules and data integrity

- Waiting priority is 1–5. Duplicate ACTIVE/MATCHED registrations for the same patient/type are prevented by service checks and the existing generated-column unique index.
- New registrations are ACTIVE. Generic updates cannot set MATCHED or COMPLETED. Only unreferenced ACTIVE registrations can be edited or cancelled. Only unreferenced ACTIVE/CANCELLED registrations can be deleted. Historical match references freeze a registration even when the matches are terminal.
- Candidates require an ACTIVE registration, AVAILABLE organ, equal organ type, no reservation/transplant integrity record, no existing pair history, and no approved conflict for that organ or registration. No blood-group matching algorithm, clinical score, or claim of medical suitability was invented.
- Candidate preview never writes. The user selects a pair and confirms Save proposed match; the server repeats all eligibility checks under locks. Historical pairs cannot be recreated; multiple alternative PROPOSED/TESTING pairs are allowed, while competing approvals are rejected.
- Candidate/status/test writes lock organ, then registration, then match where applicable. Pair identity is immutable. Row locking serializes application proposals/approvals; foreign keys remain enabled. Full concurrent load testing was not performed.
- Match transitions: PROPOSED → TESTING/REJECTED/CANCELLED; TESTING → APPROVED/REJECTED/CANCELLED; APPROVED → CANCELLED only without active/completed allocations. REJECTED and CANCELLED are terminal. Active/completed allocations block status changes.
- Approval requires the latest test ordered by test_date DESC, test_id DESC to have COMPATIBLE overall, blood-group, and HLA flags, with no competing approved match. This consistency validation concerns fictional recorded flags, not clinically validated medical decision-making.
- Tests are append-only, permitted only for eligible TESTING matches. The server assigns UTC test_date. Clients cannot backdate, overwrite, or delete evidence. Inconsistent COMPATIBLE flags and invalid user references are rejected. A performer must be an existing active CLINICIAN, following the documented role responsibilities; selecting that reference does not authenticate the person.
- Every successful application write uses the existing audit/outbox helper inside the same MySQL transaction as the business change. Failure rolls back all three. Development audit user_id remains NULL because there is no authenticated identity.
- No application route in this phase reserves, allocates, transplants, discards, or changes organ status. MongoDB is not contacted.

## MySQL tables accessed

New feature reads: waiting_list, organ_match, compatibility_test, patient, donor, organ, organ_type, transplant_centre, app_user, organ_allocation, active_organ_reservation, organ_transplant_record.

New feature writes: waiting_list, organ_match, compatibility_test (currently blocked by missing clinician), audit_log, sync_outbox.

Integration tests additionally create fictional donor/patient/organ fixtures through the existing Phase 3C services, inside an outer transaction that is always rolled back. They never create app_user records. Live schema inspection used read-only information_schema queries.

## Validation and results

- JavaScript syntax checks using node --check across src/lib, src/app/api, tests, and next.config.mjs: passed.
- npm test: 26 unit tests passed, including all 12 existing Phase 3C tests. New tests cover fields, IDs, priority, enum validation, status transitions, evidence consistency, guarded writes, parameter binding, read-only preview, actual outbox keys, performer restrictions, competing approvals, and allocation protection.
- Positive approval and compatibility-append service paths were verified with explicitly isolated in-memory repository/database mocks. These tests do not create users or prove those positive paths against the live database.
- npm run test:integration: both Phase 3C and Phase 3D integration tests passed. The script runs integration files sequentially to keep count-preservation assertions deterministic.
- Phase 3D integration tested actual-MySQL duplicate active registration rejection, the priority CHECK constraint, organ-type mismatch service/trigger rejection, duplicate proposals, read-only candidate exclusion, referenced-registration protection, invalid status transitions, untested approval service/trigger rejection, cancellation, safe fixture deletion, and the no-clinician blocker. Supported POST/PATCH/DELETE handlers were exercised with rollback-controlled fixtures.
- An injected outbox failure after actual business and audit inserts left no partial records after rollback. All donor, patient, organ, registration, match, test, audit, outbox, and user counts matched their pre-test values after final rollback. Rolled-back inserts can consume auto-increment numbers; no counters were reset.
- Actual-MySQL positive compatibility insertion, incompatible-test approval rejection, compatible-test approval, and populated history validation were not executed because no active clinician exists. No positive result is claimed for those blocked cases. Unit/service mocks cover their decision paths.
- npm run build: final production build passed with exit code 0 using the new production output directory. Earlier attempts compiled and prerendered but hit sandbox/Windows generated-file errors (EPERM/UNKNOWN) in the existing .next directory. next.config.mjs now keeps production output in .next-build and development output in .next; .next-build is ignored. Existing files were not removed. Both next build and next start use the same production directory.
- npm run dev: started successfully on port 3000. Final development HTTP checks passed.
- npm run start initially found port 3000 occupied. npm run start -- --port 3001 then started successfully; production HTTP checks passed. The temporary production validation server was stopped afterward; the development site remains on port 3000.
- HTTP checks in both development and production: /waiting-list, /matching, and all new collection/preview/options GET endpoints returned 200. Existing registration/match detail GETs returned 200; valid absent IDs returned 404; invalid pagination returned 400; supported tokenless writes returned 403. Compatibility/match history deletion returned 405.
- Final health in both modes: HTTP 200, status ok, mysql connected, 4 donors, 4 patients, 5 organs. Initial read-only inspection also confirmed 4 registrations, 4 matches, and 0 tests; rollback tests preserved these counts.
- Browser read checks passed for waiting-list records/details/search/empty state, navigation to matching, recorded match details, empty compatibility history, the clinician blocker, candidate preview/details, and disabled write actions in read-only mode. The layout was visually reviewed. Browser write submissions were NOT executed. No claim is made that write forms or a complete browser write round trip were tested.
- git diff --exit-code -- docs database passed: existing documentation and SQL files are unchanged. No dependencies were added; npm ls confirmed the existing required packages.

## Schema/documentation discrepancies

- The inspected live columns, enums, waiting-list generated columns/index, and relevant triggers match the migrations.
- The schema has no unique constraint on organ_match(waiting_id, organ_id). Duplicate/conflicting match prevention is therefore enforced by application checks with parent-row locking; arbitrary external SQL can bypass these application-only rules. No migration was changed.
- The match update trigger validates organ type and latest overall COMPATIBLE evidence, but does not enforce the full documented status-transition graph or competing approvals. Services enforce those rules and require consistent component flags without altering SQL.
- The existing business rules describe audit and outbox events for allocation/transplant procedures; 006_procedures.sql currently inserts outbox events but no audit_log entries. That pre-existing discrepancy was left unchanged because those workflows are outside Phase 3D.
- The existing SQL concepts documentation lists database/queries/crud.sql, which is absent. No replacement SQL script was invented.

## Remaining limitations and setup

1. An existing active CLINICIAN app_user is required before compatibility entry or live positive approval can be exercised. No user was created, and no setup/seed command was run. This needs the future authorized user-management setup.
2. Production login, identity verification, and role-based authorization remain pending. Existing token-based local development writes are reused; production writes stay blocked. Read endpoints are unauthenticated and must contain only fictional demonstration data.
3. To use local writes, the existing ignored .env.local must opt into ORGANSYNC_DEV_WRITES=true and supply an ORGANSYNC_DEV_WRITE_TOKEN of at least 32 characters. Restart npm run dev and enter that token on the workflow page. It stays in memory, is sent as a Bearer token, and is not embedded in client code or stored in browser storage. The .env.local file was not modified by this work.
4. Full browser write submissions and concurrent stress tests remain unverified. No existing demo record was used for a write test.
5. MongoDB synchronization is deferred to Phase 3F. This phase writes only the existing transactional outbox metadata.
6. Phase 3E allocation/transplant workflows were not implemented. No known application compilation errors remain after the final successful build; environment-specific .next file-access failures were addressed by isolating production output.
