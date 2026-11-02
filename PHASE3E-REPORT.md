# OrganSync V2 — Combined Phase 3E report

Allocation, transplant recording, follow-up management, clinician development authorization, and real MySQL viva demonstrations are implemented in the existing project. Phase 3F/MongoDB synchronization was not started.

Final validation: 34 unit tests passed; 43 MySQL integration tests passed; syntax checks passed; npm run build passed with exit code 0. The integration suite includes 39 independently executed database demonstration scenarios. Current live objects: 20 triggers and 3 transaction-safe procedures. Server: MySQL 8.0.46.

Migration 008 was explicitly approved and has now been applied and verified. It added exactly four integrity triggers and its ledger entry, without replacing any existing object or modifying earlier migrations. Do not rerun either applied migration.

## Approved Migration 008 results — 2 November 2026

- Status: applied_and_verified. Started 2026-11-01T18:35:02.060Z; completed 2026-11-01T18:35:02.303Z (UTC evidence timestamps).
- Preflight: organsync_v2, MySQL 8.0.46, ledger 007 present/008 absent, all four targets absent, 16 existing triggers, and all three transaction-safe procedures present. Columns/enums matched the SQL. Application rechecked metadata against that fresh preflight and acquired a migration advisory lock.
- Applied exactly four CREATE TRIGGER statements and one ledger INSERT, sequentially with stop-on-first-error behavior. MySQL compiled every definition successfully. Live definitions, timing, event, and table were verified before ledger insertion.
- Final inventory: 20 triggers, 3 procedures, and ledger versions 001, 007, 008. Original trigger and procedure definitions remained unchanged.
- All original row values across 19 tables matched pre-migration SHA-256 fingerprints after migration AND after the complete integration suite. The only intentional row addition is schema_migration version 008. Existing 001/007 ledger rows were checked separately and unchanged. No fixture records remain. AUTO_INCREMENT gaps from rolled-back fixtures are expected and were not reset.
- Positive cases: valid active-clinician evidence accepts allocation; RESERVED → RELEASED is accepted; valid clinician follow-up INSERT is accepted. Negative cases: deactivated evidence performer rejects allocation; RELEASED → RESERVED is rejected; follow-up UPDATE and DELETE are rejected with their exact trigger SIGNAL messages. The latter guards deliberately have no accepted UPDATE/DELETE path; valid append-only INSERT is the positive control.
- One new fixture initially attempted to approve an already approved match; that test setup was corrected. The final integration suite has 43 passes, 0 failures, and 0 skips. No migration retry or trigger rewrite was needed.
- Complete unit suite: 34 passes. Complete integration suite: 43 passes, including 39 real SQL demonstration scenarios. JavaScript syntax checks and production build passed.

New operational scripts:

- [scripts/apply-migration008.mjs](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/scripts/apply-migration008.mjs) — exact statement allowlist, delimiter parsing, metadata/schema drift checks, fingerprinting, sequential application, and verification. One-time application only; do not rerun against the now-applied state.
- [scripts/verify-migration008.mjs](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/scripts/verify-migration008.mjs) — read-only live definition, ledger, source hash, and original-row verification.

Evidence:

- [.artifacts/migration008-readonly-preflight.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.artifacts/migration008-readonly-preflight.json)
- [.artifacts/migration008-application.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.artifacts/migration008-application.json)
- [.artifacts/migration008-final-verification.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.artifacts/migration008-final-verification.json)

The viva catalog and fixture builder now include seven additional 008-related positive/negative scenarios. The actual-result matrix below has been regenerated from all 39 live runs. The approved 008 SQL file and all earlier migrations remain unchanged.

## Files modified

- [.env.example](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.env.example)
- [.gitignore](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.gitignore)
- [src/app/globals.css](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/globals.css)
- [src/app/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/page.jsx)
- [src/components/layout/ModuleNavigation.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/ModuleNavigation.jsx)
- [src/components/tables/WorkflowTable.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/tables/WorkflowTable.jsx)
- [src/lib/repositories/transplant.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/transplant.repository.js)
- [src/lib/services/transplant.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/transplant.service.js)
- [src/lib/sync/outbox.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/sync/outbox.js)

## Files created

- [database/migrations/007_phase3e_integrity_proposal.sql](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/database/migrations/007_phase3e_integrity_proposal.sql)
- [database/migrations/008_phase3e_reconciliation_proposal.sql](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/database/migrations/008_phase3e_reconciliation_proposal.sql)
- [src/lib/validation/transplants.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/validation/transplants.js)
- [src/lib/auth/clinician.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/auth/clinician.js)
- [src/lib/api/phase3e.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/api/phase3e.js)
- [src/lib/database-demo/catalog.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/database-demo/catalog.js)
- [src/lib/repositories/allocation.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/allocation.repository.js)
- [src/lib/repositories/follow-up.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/follow-up.repository.js)
- [src/lib/repositories/demo.repository.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/repositories/demo.repository.js)
- [src/lib/services/allocation.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/allocation.service.js)
- [src/lib/services/follow-up.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/follow-up.service.js)
- [src/lib/services/database-demo.service.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/lib/services/database-demo.service.js)
- [src/components/forms/DevelopmentAccess.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/forms/DevelopmentAccess.jsx)
- [src/components/layout/TransplantPage.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/TransplantPage.jsx)
- [src/components/layout/DatabaseDemoPage.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/components/layout/DatabaseDemoPage.jsx)
- [src/app/transplants/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/transplants/page.jsx)
- [src/app/database-demo/page.jsx](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/database-demo/page.jsx)
- [src/app/api/allocations/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/allocations/route.js)
- [src/app/api/allocations/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/allocations/[id]/route.js)
- [src/app/api/allocations/[id]/release/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/allocations/[id]/release/route.js)
- [src/app/api/transplants/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/transplants/route.js)
- [src/app/api/transplants/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/transplants/[id]/route.js)
- [src/app/api/follow-ups/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/follow-ups/route.js)
- [src/app/api/follow-ups/[id]/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/follow-ups/[id]/route.js)
- [src/app/api/database-demo/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/database-demo/route.js)
- [src/app/api/development/clinician/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/development/clinician/route.js)
- [src/app/api/development/clinician-session/route.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/src/app/api/development/clinician-session/route.js)
- [tests/unit/transplants.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/unit/transplants.test.js)
- [tests/integration/transplants.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/integration/transplants.test.js)
- [tests/integration/triggers.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/integration/triggers.test.js)
- [tests/integration/demo-api.test.js](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/tests/integration/demo-api.test.js)
- [PHASE3E-REPORT.md](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/PHASE3E-REPORT.md)

Generated evidence, ignored by Git:

- [.artifacts/phase3e-trigger-results.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.artifacts/phase3e-trigger-results.json)
- [.artifacts/phase3e-live-inventory.json](C:/Users/Sharath/OneDrive/Desktop/dbms_level3/organsync-v2/.artifacts/phase3e-live-inventory.json)

No dependencies were added. Existing Phase 3C/3D files and architecture were reused. The shared table received a row-key fix so allocation and follow-up rows have stable unique keys. Existing layout/auth/SQL source files were not replaced.

## API endpoints

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| /api/allocations | GET, POST | Paginated allocations; reserve an eligible approved match |
| /api/allocations/[id] | GET | Joined allocation details |
| /api/allocations/[id]/release | POST | Release an exact active reservation atomically |
| /api/transplants | GET, POST | Paginated transplant history; complete a reserved allocation |
| /api/transplants/[id] | GET | Joined transplant details |
| /api/follow-ups | GET, POST | Paginated append-only follow-up history and entry |
| /api/follow-ups/[id] | GET | Follow-up details |
| /api/development/clinician | POST | Explicitly authorized setup using the user's supplied fictional identity and password |
| /api/development/clinician-session | POST | Verify password and create a one-hour development session |
| /api/database-demo | GET, POST | Guarded live object inventory; run one fixed rollback-only SQL scenario |

All database routes use Node.js, parameterized values, consistent JSON, and no-store responses. Reads support page/pageSize. Allocations support match_id/allocation_status filters; transplants support outcome; follow-ups support transplant_id. Transplant/follow-up histories have no edit/delete API.

## Working frontend

- /transplants has allocation, transplant, and follow-up tabs, responsive tables, filtering, pagination, record details, loading/empty/error/success states, allocation release confirmation, transplant recording, and append-only follow-up forms.
- Clinician setup requires a supplied fictional name, email, password of 12–128 characters, and explicit fictional-account confirmation. No persistent identity or password was invented by the agent.
- Sign-in verifies the stored scrypt password hash. Session tokens are random, stored only as SHA-256 hashes in app_session, expire after one hour, and remain only in page memory in the browser. Clear page session clears browser state; it does not revoke the database session early.
- All supported Phase 3E writes require the existing local development token AND an authenticated active clinician session. The actor is derived from that session, not a submitted recorded_by field. Follow-ups record that actual clinician FK.
- /database-demo shows the exact database object, table, timing/event, intended SQL operation, expected/actual accepted or rejected result, sanitized MySQL code/errno/SQLSTATE, fixed SQL template and fixture parameters, actual before/after state, audit/outbox state where applicable, live definition fingerprint, timestamp, and verified rollback.
- Homepage and existing module navigation link to both pages. The demo page links directly to the transplant workspace.
- No arbitrary SQL editor, user-selected record IDs, migration execution endpoint, or generic database command interface exists.

## Database execution, procedures, and integrity

The original sp_allocate_organ, sp_release_allocation, and sp_record_transplant were inspected in 006_procedures.sql. SHOW CREATE PROCEDURE returned ER_SP_DOES_NOT_EXIST (1305) for all three at initial live inspection. Their source controls its own transactions and omits audit_log inserts; using those bodies inside an existing application/fixture transaction would not be safe. MySQL START TRANSACTION implicitly commits an existing transaction: [official MySQL transaction documentation](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html).

The implementation therefore supports caller-owned MySQL transaction orchestration when safe procedures are absent. Later during this task, the three companion *_tx procedures became installed by an operation outside this agent's tool calls. Their actual definitions were re-inspected. The final integration suite verified real allocation, release, and transplant procedure execution, including successful and rejected direct CALL scenarios. The application now selects these installed procedures rather than the fallback path.

- Companion procedures are based on 006's workflow logic, have no START TRANSACTION/COMMIT/ROLLBACK, enforce active clinician/compatible evidence, and include audit/outbox inserts inside the caller's transaction.
- The caller creates SAVEPOINT organsync_phase3e_call; each installed companion consumes it before doing business writes. Calling without the hand-off savepoint fails before business changes. The application refuses procedure definitions containing transaction-control/DDL/dynamic procedure execution or missing the expected hand-off/audit/outbox operations.
- The service owns the final commit/rollback and locks organ, waiting registration, match, and allocation consistently. Existing foreign keys, triggers, unique active reservations, and permanent transplant records remain enabled.
- Allocation requires APPROVED, latest compatible overall/blood-group/HLA flags, an active clinician performer reference, ACTIVE waiting status, AVAILABLE organ status, equal organ type, no competing approval, and no prior active/completed allocation.
- Release requires RESERVED, the exact reservation, and consistent RESERVED/MATCHED parent states. Completion requires that exact reservation, current compatible clinician evidence, a valid centre and timestamp, and no prior transplant/permanent organ record.
- Completion updates allocation/organ/registration to COMPLETED/TRANSPLANTED/COMPLETED and removes the active reservation atomically.
- Follow-up dates cannot precede the transplant or be in the future; recorded_by is taken from the authenticated session. History is append-only through the application. Database-level update/delete protection for follow-ups is now enforced by Migration 008 and verified with real MySQL rejection tests.
- Business writes, audit entries, and outbox events are atomic. Procedure mode emits them inside the routine; the fallback path uses the existing helper. They are not double-inserted. Payloads contain IDs/action metadata, not names, notes, passwords, or session tokens.
- No medical scoring or clinically validated suitability rule was invented.

## Real MySQL demonstration safety and verification

Each demonstration selects one hard-coded scenario. GET/POST authorization reuses the existing local development guard. Execution additionally requires ORGANSYNC_DEV_DB_DEMO=true and confirm_rollback=true on the request. Production execution is always denied.

Before creating fixtures, the runner verifies all 16 participating business/audit/outbox tables are InnoDB. It then creates fresh fictional centre/type/person/organ/registration/match records inside one transaction. Any clinician FK fixture is uncommitted, has a deliberately unusable login hash, is never a persistent development identity, and is removed by rollback. Normal clinician account setup is a separate authenticated development action using supplied credentials.

The selected attempt goes directly through mysql2 SQL execution; normal business-service validation does not intercept it. Trigger attribution requires the correct live name/table/timing/event plus actual MySQL 1644/45000 and an exact known SIGNAL message present in that live object's definition. Constraint attribution requires the actual MySQL error and the named constraint/index. Unexpected errors are not relabeled as successful trigger demonstrations. Accepted row operations must affect rows and change the captured state; accepted procedure calls must change the captured state. Both successful and rejected scenarios are finally rolled back, and fixture parent/identity absence is verified.

All current triggers are BEFORE triggers. No AFTER-trigger result is invented. Deletion guards intentionally have only rejection cases because those rules prohibit every deletion. Successful cases cover permitted inserts and updates, plus all three transaction-safe procedures.

## Actual demonstration matrix

This is a recorded test snapshot, not simulated UI data. The website executes fresh SQL for each authorized run. Full messages, fixed statements, parameters, before/after state, hashes, and rollback evidence are in the ignored results JSON linked above. Every row below passed with fixture absence verified.

| Scenario | Enforcement | Timing/event · table | Expected | Actual | Exact enforcing object | MySQL errno / SQLSTATE |
| --- | --- | --- | --- | --- | --- | --- |
| match-type-reject | trigger | BEFORE INSERT · organ_match | rejected | rejected — PASS | trg_match_validate_insert | 1644 / 45000 |
| match-type-accept | trigger | BEFORE INSERT · organ_match | accepted | accepted — PASS | trg_match_validate_insert | success / 00000 |
| approval-reject | trigger | BEFORE UPDATE · organ_match | rejected | rejected — PASS | trg_match_validate_update | 1644 / 45000 |
| approval-accept | trigger | BEFORE UPDATE · organ_match | accepted | accepted — PASS | trg_match_validate_update | success / 00000 |
| allocation-reject | trigger | BEFORE INSERT · organ_allocation | rejected | rejected — PASS | trg_allocation_validate_insert | 1644 / 45000 |
| allocation-accept | trigger | BEFORE INSERT · organ_allocation | accepted | accepted — PASS | trg_allocation_validate_insert | success / 00000 |
| reservation-reject | trigger | BEFORE INSERT · active_organ_reservation | rejected | rejected — PASS | trg_reservation_validate_insert | 1644 / 45000 |
| reservation-accept | trigger | BEFORE INSERT · active_organ_reservation | accepted | accepted — PASS | trg_reservation_validate_insert | success / 00000 |
| permanent-record-reject | trigger | BEFORE INSERT · organ_transplant_record | rejected | rejected — PASS | trg_transplant_record_validate_insert | 1644 / 45000 |
| permanent-record-accept | trigger | BEFORE INSERT · organ_transplant_record | accepted | accepted — PASS | trg_transplant_record_validate_insert | success / 00000 |
| transplant-update-reject | trigger | BEFORE UPDATE · transplant | rejected | rejected — PASS | trg_transplant_prevent_update | 1644 / 45000 |
| transplant-update-accept | trigger | BEFORE UPDATE · transplant | accepted | accepted — PASS | trg_transplant_prevent_update | success / 00000 |
| transplant-delete-reject | trigger | BEFORE DELETE · transplant | rejected | rejected — PASS | trg_transplant_prevent_delete | 1644 / 45000 |
| permanent-delete-reject | trigger | BEFORE DELETE · organ_transplant_record | rejected | rejected — PASS | trg_organ_transplant_prevent_delete | 1644 / 45000 |
| organ-status-reject | trigger | BEFORE UPDATE · organ | rejected | rejected — PASS | trg_organ_status_validate | 1644 / 45000 |
| organ-status-accept | trigger | BEFORE UPDATE · organ | accepted | accepted — PASS | trg_organ_status_validate | success / 00000 |
| waiting-status-reject | trigger | BEFORE UPDATE · waiting_list | rejected | rejected — PASS | trg_waiting_status_validate | 1644 / 45000 |
| waiting-status-accept | trigger | BEFORE UPDATE · waiting_list | accepted | accepted — PASS | trg_waiting_status_validate | success / 00000 |
| priority-constraint-reject | constraint | Procedure/constraint INSERT · waiting_list | rejected | rejected — PASS | chk_waiting_priority | 3819 / HY000 |
| duplicate-registration-reject | constraint | Procedure/constraint INSERT · waiting_list | rejected | rejected — PASS | uq_active_waiting_registration | 1062 / 23000 |
| match-transition-reject | trigger | BEFORE UPDATE · organ_match | rejected | rejected — PASS | trg_match_transition_guard | 1644 / 45000 |
| compatibility-insert-reject | trigger | BEFORE INSERT · compatibility_test | rejected | rejected — PASS | trg_compatibility_insert_guard | 1644 / 45000 |
| compatibility-update-reject | trigger | BEFORE UPDATE · compatibility_test | rejected | rejected — PASS | trg_compatibility_immutable_update | 1644 / 45000 |
| compatibility-delete-reject | trigger | BEFORE DELETE · compatibility_test | rejected | rejected — PASS | trg_compatibility_immutable_delete | 1644 / 45000 |
| transplant-insert-reject | trigger | BEFORE INSERT · transplant | rejected | rejected — PASS | trg_transplant_insert_guard | 1644 / 45000 |
| follow-up-date-reject | trigger | BEFORE INSERT · transplant_follow_up | rejected | rejected — PASS | trg_follow_up_insert_guard | 1644 / 45000 |
| procedure-allocate-accept | procedure | Procedure/constraint CALL · organ_allocation | accepted | accepted — PASS | sp_allocate_organ_tx | success / 00000 |
| procedure-allocate-reject | procedure | Procedure/constraint CALL · organ_allocation | rejected | rejected — PASS | sp_allocate_organ_tx | 1644 / 45000 |
| procedure-release-accept | procedure | Procedure/constraint CALL · organ_allocation | accepted | accepted — PASS | sp_release_allocation_tx | success / 00000 |
| procedure-release-reject | procedure | Procedure/constraint CALL · organ_allocation | rejected | rejected — PASS | sp_release_allocation_tx | 1644 / 45000 |
| procedure-transplant-accept | procedure | Procedure/constraint CALL · transplant | accepted | accepted — PASS | sp_record_transplant_tx | success / 00000 |
| procedure-transplant-reject | procedure | Procedure/constraint CALL · transplant | rejected | rejected — PASS | sp_record_transplant_tx | 1644 / 45000 |
| allocation-evidence-reject | trigger | BEFORE INSERT · organ_allocation | rejected | rejected — PASS | trg_allocation_evidence_guard | 1644 / 45000 |
| allocation-evidence-accept | trigger | BEFORE INSERT · organ_allocation | accepted | accepted — PASS | trg_allocation_evidence_guard | success / 00000 |
| allocation-transition-reject | trigger | BEFORE UPDATE · organ_allocation | rejected | rejected — PASS | trg_allocation_transition_guard | 1644 / 45000 |
| allocation-transition-accept | trigger | BEFORE UPDATE · organ_allocation | accepted | accepted — PASS | trg_allocation_transition_guard | success / 00000 |
| follow-up-update-reject | trigger | BEFORE UPDATE · transplant_follow_up | rejected | rejected — PASS | trg_follow_up_immutable_update | 1644 / 45000 |
| follow-up-delete-reject | trigger | BEFORE DELETE · transplant_follow_up | rejected | rejected — PASS | trg_follow_up_immutable_delete | 1644 / 45000 |
| follow-up-insert-accept | trigger | BEFORE INSERT · transplant_follow_up | accepted | accepted — PASS | trg_follow_up_insert_guard | success / 00000 |

Summary: 14 accepted operations and 25 rejected operations. All 20 currently installed triggers have independently verified rejection tests. The two constraints and all three procedures also have actual database verification. No rejected trigger scenario is merely a JavaScript validation result.

## Tests executed

- npm test: 34 passed, 0 failed. Includes all existing Phase 3C/3D tests plus Phase 3E validation, explicit clinician setup, session/guard behavior, no arbitrary SQL, transaction-safe routine review, and static checks of the proposed repair.
- npm run test:integration: 43 passed, 0 failed, 0 skipped in the final run. Existing Phase 3C/3D tests are retained. The new authenticated workflow test uses user-supplied-style fictional fixture credentials, checks incorrect password/session rejection, and executes allocate → release → reallocate → transplant → follow-up on actual MySQL.
- Negative paths cover unapproved/incompatible matches, double allocation, repeated release, duplicate transplant, release after completion, invalid dates, historical record mutation, and unauthorized writes. An injected outbox failure rolls back the business and audit inserts, leaving no partial records.
- Separate tests execute every demonstrated trigger/scenario, compare rejected before/after state, verify actual SQL errors, and verify rollback. Successful procedure cases show atomic state plus audit/outbox changes before rollback.
- node --check across server JavaScript, API handlers, and tests: passed.
- npm run build: final production build passed, exit code 0. It continues to use the existing .next-build production directory and .next development directory.
- Live HTTP: /transplants and /database-demo returned 200; allocation/transplant/follow-up list GETs returned 200; invalid pagination returned 400; absent record IDs returned 404. Tokenless supported writes, clinician setup/sign-in, release, and database-demo execution returned 403.
- Guarded database-demo request handlers were also executed with actual MySQL in an isolated integration process: explicit opt-in and confirmation were required; extra sql fields were rejected; authorized execution returned real trigger evidence; production mode remained denied.
- Browser read testing during the original Phase 3E implementation verified navigation, the then-32-scenario matrix, read-only authorization controls, clinician setup fields/confirmation, transplant tabs, and empty state. The seven new 008 scenarios were verified through real MySQL integration runs; no new browser write submission is claimed. A stale dev SSR navigation cache initially caused a hydration warning; restarting only the verified project Next.js processes fixed it. Fresh browser loads of both pages then had no error/warning logs.
- Browser write forms were NOT submitted. Backend request-handler/database round trips were tested with rollback-controlled fixtures; full browser write submission is not claimed.
- Original migrations 001–006, seeds, queries, and existing documentation were not deliberately edited by this agent. A concurrent whitespace-only indentation change in 006 was observed and preserved; git diff --ignore-all-space confirmed no semantic difference in those original files.

## Current records and concurrent changes

Initial inspection found 4 donors, 4 patients, 5 organs, 10 triggers, no clinician users, and no stored procedures. During the task, another normal donor row (ID 84, Demo Donor) and a partial 007 schema installation appeared. This agent did not run DDL, execute seed scripts, or commit demonstration fixtures. The origin of those concurrent changes is not attributed here, and they were not deleted or reverted.

Final read-only inventory: 5 donors, 4 patients, 5 organs, 0 users, 0 allocations, 0 transplants, and 0 remaining rollback-demo centres. Every test verifies preservation against its own before/after snapshot. Rolled-back inserts can leave AUTO_INCREMENT gaps; counters were never reset.

## Migration 007 history and approved 008 reconciliation

I found a delimiter-generation defect in my 007 draft: the allocation-evidence and follow-up immutability blocks contain single-dollar END terminators. Meanwhile, the live database acquired a 007 ledger entry, three *_tx routines, the three unique match indexes, and six of the intended ten new triggers. The live installation is therefore partial. Once this was observed, 007 was left unchanged; it must not be rerun or silently rewritten.

The narrowly scoped 008_phase3e_reconciliation_proposal.sql has now created these four formerly absent objects:

- trg_allocation_evidence_guard
- trg_allocation_transition_guard
- trg_follow_up_immutable_update
- trg_follow_up_immutable_delete

After explicit approval, a fresh read-only preflight confirmed 007 recorded, 008 absent, all four target names absent, and the original 16 triggers and three procedures unchanged. Delimiter/statement allowlists and referenced live columns/enums were checked. MySQL 8.0.46 compiled all four CREATE TRIGGER statements successfully. Each definition was verified before the sole 008 ledger INSERT. No SQL error occurred during application. The process was configured to stop immediately on any error, with no DROP, replacement, seed, or reset operation. No database tables or public columns were added. Migration 007 and all earlier migration files/ledger rows were not rerun or modified.

The applied 008 guards now enforce allocation evidence/status and follow-up immutability rules in MySQL in addition to application checks. Existing match transitions, compatibility history guards, transplant insertion checks, clinician follow-up date checks, and unique pair/approval indexes were observed installed and tested. Future changes must be versioned rather than editing applied migrations.

The original 006 files still omit audit inserts and own transaction control; those historical definitions were not changed. The installed *_tx companions supply the corrected caller-owned transaction and audit/outbox behavior and were verified by real CALL tests.

## Local use and remaining limits

1. Use npm run dev. The existing ignored .env.local must contain a valid development token and ORGANSYNC_DEV_WRITES=true for local writes. Enable ORGANSYNC_DEV_DB_DEMO=true separately for rollback demonstrations. The agent did not change .env.local or expose existing credentials.
2. On /transplants, enter the development token. Supply your chosen fictional clinician name/email/password with explicit account-creation confirmation, then sign in. No persistent clinician was created automatically. Accounts created by this development workflow use the supported scrypt:v1 password format.
3. On /matching, use fictional compatible evidence associated with the valid clinician and the documented status transitions; then allocate the approved match on /transplants. Match IDs and allocation IDs come from the existing lists. Production RBAC remains pending; these are deliberately development-only workflows.
4. On /database-demo, enter the token, inspect live objects, explicitly confirm rollback execution, then choose a scenario. Every result is fresh SQL evidence with real state and rollback checks. A missing optional object disables its scenario rather than fabricating a result.
5. Production writes and demo execution remain blocked. Reads still expose only fictional educational records without production authorization. Broad production RBAC, browser write round trips, and concurrent load stress tests are not claimed complete.
6. Migration 008 is applied and its four guards passed live runtime verification. No Phase 3F work, MongoDB connection, synchronization worker, or clinical decision-making was introduced. Remaining limitations are production RBAC, full browser write submissions, and concurrent load testing.
