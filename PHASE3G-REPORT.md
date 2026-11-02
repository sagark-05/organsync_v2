# OrganSync V2 — Phase 3G Final Verification

Verified on 2 November 2026 (Asia/Kolkata; evidence also records UTC timestamps).

## Readiness result

The requested academic faculty-demo scope passed the required verification. This is development/demo readiness, not production-security certification. No database, migration, trigger, procedure or existing record was reset, recreated or deleted.

| Validation | Actual result |
|---|---|
| Unit suite | 43 passed, 0 failed |
| Integration suite | 54 passed, 0 failed, 0 skipped |
| Browser workflow journal | 28 passed checks, including positive and negative paths |
| Database demonstration page | All 39 scenarios executed through browser controls: 14 accepted, 25 rejected, rollback verified |
| Independent SQL integration verification | Same 39 scenarios passed with exact enforcing object and actual MySQL result |
| Responsive navigation | 18 passed checks: homepage and eight management pages at desktop/mobile widths |
| Syntax checks | 91 JavaScript/MJS files passed; JSX compiled by Next.js |
| Production build | Passed, Next.js 16.4.3 |
| Production start / HTTP | Passed on temporary port 3011; homepage and sync page HTTP 200 |
| Production guards | Seven selected write endpoints returned HTTP 403 |
| Live inventory | 19 tables, 20 triggers, 3 procedures; all tables InnoDB |
| Preservation | All 86 pre-existing MySQL rows and 54 pre-existing Atlas documents retained identical hashes; trigger/procedure definitions unchanged |
| Existing academic SQL examples | All 14 SELECT/CTE examples from joins, ctes, aggregations and subqueries executed successfully |
| Final Atlas state | Connected; 52 DELIVERED events, 52 sync_events documents, 50 audit_history documents; no PENDING/PROCESSING/FAILED events |

## Scope inspected and approach

Reviewed the Phase 3E/3F reports, existing Next.js instructions, App Router/configuration guidance, schema, trigger/procedure sources, live object metadata, SQL examples, ER/normalization documents, authorization/clinician helpers, repositories/services, forms and synchronization code.

The existing development server was left intact. Browser workflow tests used a separate loopback-only host on port 3010 and isolated `.next-phase3g` build output. Normal API routes, validation, foreign keys, triggers, procedures and development/clinician guards were used; no test-only bypass was added to them. A fresh preservation baseline was captured before writes. The baseline is separate from the earlier Phase 3F baseline.

Ordinary web routes commit their transactions. One clearly labeled fictional clinical journey was therefore intentionally retained, together with its audit/outbox/Atlas evidence. All 39 SQL demonstrations and existing clinical integration fixtures used rollback-controlled transactions. Repeated synchronization integration tests intentionally retain fictional metadata markers. AUTO_INCREMENT gaps are expected and were not reset.

## Browser end-to-end results

Real in-app browser controls were used, including native date fields, search/lookups, select menus, dialogs, tabs, form submission, authorization inputs, history/detail views and synchronization buttons. The journal is `.artifacts/phase3g-browser-results.json`.

| Workflow / negative case | Verified result |
|---|---|
| Empty donor form | Required-field validation blocked submission |
| Invalid development token | Sanitized authorization rejection; no unauthorized donor created |
| Donor registration | Donor 382 created through the UI |
| Patient registration | Patient 728 created through the UI |
| Organ registration / donor lookup | Organ 742 linked to donor 382 and initially AVAILABLE |
| Waiting list / patient lookup | Registration 778 created ACTIVE with stored priority 3 |
| Candidate preview / confirmation | Filtered exact fictional patient/organ pair; saved PROPOSED match 391 after confirmation |
| Match state transitions | PROPOSED → TESTING → APPROVED with valid evidence |
| Missing compatibility evidence | Application rejected approval; it was not mislabeled as trigger enforcement |
| Compatibility assessment/history | Test 226 appended with all COMPATIBLE flags and active fictional clinician reference 358 |
| Invalid clinician password | Invalid-credentials error; no clinical write session granted |
| Valid clinician sign-in | Existing guarded sign-in succeeded and enabled clinical forms |
| Allocation | Allocation 190 RESERVED via installed MySQL procedure |
| Double allocation | Rejected because the candidate was no longer ACTIVE/AVAILABLE |
| Release / reallocation | Confirmed release of 190; new allocation 191 RESERVED |
| Transplant | Transplant 103 SUCCESSFUL via procedure; allocation 191 COMPLETED |
| Invalid follow-up date | Date preceding transplant rejected |
| Follow-up | Follow-up 35 saved and shown in append-only history; recorded_by is signed-in clinician 358 |
| Clear browser clinician session | Further clinical form writes disabled |
| Database-demo page | 39 real operations, exact object/result/error/state, and verified rollback |
| Sync confirmation | Batch control disabled before explicit authorization checkbox |
| Journey delivery | Events 432–446 delivered in two authorized browser batches |
| Fixed fictional sync demonstration | Real event 494 committed and delivered with one audit document |
| Atlas audit/error history | Actual sanitized audit rows shown; historical errors distinguished from current FAILED count |
| Invalid follow-up filter after fix | No stale table on invalid `abc`; valid transplant filter 103 restores follow-up 35 |
| Navigation / breakpoints | Nine pages at two widths passed; table overflow stayed inside scroll containers |
| Final browser console inspection | No error/warn entries during final navigation checks |

Responsive checks requested widths 1440 and 390. The browser reported 1425 and 375 content widths after scrollbar handling; document scroll widths equaled those content widths on every page. Screenshots were inspected and saved. Temporary viewport overrides were reset.

### Retained fictional journey

The test clinician was created through the existing guarded fictional setup endpoint, not by bypassing password hashing, authentication or foreign keys. Its identity is explicitly fictional. The setup endpoint correctly returned HTTP 201. Credentials are not included in this report.

| Record | ID / final state |
|---|---|
| Donor / patient | 382 / 728 |
| Organ | 742 TRANSPLANTED |
| Waiting registration | 778 COMPLETED |
| Match / compatibility test | 391 APPROVED / 226 all COMPATIBLE |
| Clinician | 358, active fictional faculty-test identity |
| Released allocation | 190 RELEASED |
| Completed allocation | 191 COMPLETED |
| Transplant | 103 SUCCESSFUL |
| Follow-up | 35, transplant 103, recorded_by 358 |
| Active reservation for organ 742 | None |
| Permanent mapping for organ 742 | Exactly one, to transplant 103 |

The final joined MySQL query independently verified these relationships and states. Existing unrelated donor, patient, organ and other records were unchanged. The new clinician permits the previously conditional Phase 3D positive compatibility integration path to run; the final suite had no skips or missing-clinician diagnostic.

## Defects and presentation gaps fixed

1. **Stale follow-up rows after a rejected filter.** Reproduced by entering `abc` as transplant ID: the API rejected it while the old table remained visible. The frontend now clears failed query results and suppresses misleading empty-result text on query errors. Browser regression checks verified zero tables on the rejected filter and restoration of follow-up 35 for valid ID 103. Valid data can remain visible for unrelated write errors.
2. **Audit history not inspectable on the sync page.** The earlier page showed only a collection count. Added a bounded read-only `recentAudits` projection and a sanitized audit-history table, with no actor/contact/credential fields. Added a real Atlas integration test enforcing the exact allowed field set and maximum 20 records.
3. **Historical error ambiguity.** Added text explaining that retained attempt errors can belong to recovered events and that the MySQL FAILED count is authoritative for current failures. The browser displayed real retry history alongside zero current failures.

No SQL guard was relaxed. No migration rewrite, schema change, seed execution or broad RBAC implementation was necessary.

Test-tool corrections were not application defects: native date fields required the supported AX value setter; some navigation actions needed a hydration/state check; an interrupted browser binding was recovered; the setup-check harness initially expected HTTP 200 instead of the endpoint's correct 201. The already-created fictional account was retained and setup was not repeated. The final checks passed.

## Authorization and synchronization evidence

Read-only/denied API checks on the development test host:

- Missing development token: HTTP 403 for donors, patients, organs, waiting-list, matches, compatibility-tests, allocations, transplants, follow-ups, database-demo, database-sync and clinician-session.
- Valid development token without clinician session: allocation HTTP 401.
- Foreign Origin: donor POST HTTP 403.
- Browser invalid password and valid sign-in were both exercised.
- Production POST checks for donors, allocations, transplants, follow-ups, database-demo, database-sync and clinician-session all returned HTTP 403 before mutation.

Final Atlas totals are 52 events and 50 audits. The two-record difference is intentional: authentication identity/session events are redacted markers and their identity audits are excluded. Every delivered outbox event was read back from Atlas and compared against its expected sanitized document. The 54 original MongoDB documents remained unchanged. The independent preservation test also checked all original MySQL records and trigger/procedure hashes.

The existing sync integration suite exercised real successful persistence, replay/duplicate prevention, backoff, actual driver connection outage, partial failure after real Atlas persistence, concurrent workers, stale PROCESSING recovery, and disconnect/crash replay. Committed producer metadata and audit rows survived the outage. No TLS checks or Atlas network security settings were disabled. Historical intentional failures remain in the local error log; all tested events recovered.

## Commands executed

```text
node scripts/phase3f-preservation.mjs --baseline=phase3g --capture
node scripts/phase3g-server.mjs --authorize-fictional-browser-testing
node scripts/phase3g-api-checks.mjs --setup-fictional-clinician
node scripts/phase3g-api-checks.mjs
npm test
npm run test:integration
npm run build
node --check <each of 91 JS/MJS source, API, script and test files>
npm run start -- -p 3011
node scripts/verify-phase3g.mjs
node scripts/phase3f-preservation.mjs --baseline=phase3g
```

Also performed live browser actions and production HTTP requests; their evidence is saved separately. No new dependencies were installed. The normal `npm run dev` host was already running and was not stopped. The temporary browser-test and production-verification hosts were stopped after verification. The standard localhost:3000 synchronization page was then checked again: Atlas Connected, 52 delivered events, and 20 recent audit rows.

## Files created or modified by Phase 3G

- `src/components/layout/TransplantPage.jsx`: failed-query state fix.
- `src/components/layout/DatabaseSyncPage.jsx`: recent audit table and historical-error explanation.
- `src/lib/services/sync.service.js`: sanitized recent audit projection.
- `tests/integration/sync.test.js`: audit projection regression test.
- `scripts/phase3f-preservation.mjs`: validated baseline label option so original Phase 3F evidence is preserved.
- `scripts/phase3g-server.mjs`: explicit opt-in, loopback-only browser-test host with normal guards.
- `scripts/phase3g-api-checks.mjs`: authorization checks and optional guarded fictional clinician setup; do not rerun setup for an already-created identity.
- `scripts/verify-phase3g.mjs`: read-only academic query, inventory, journey and Atlas checks. Journey IDs refer specifically to this retained rehearsal; it intentionally fails if that evidence is absent.
- `next.config.mjs`, `.gitignore`: isolated and ignored browser-test cache; ordinary development/production paths preserved.
- `FACULTY-DEMO-GUIDE.md`: preparation, 14-minute sequence, ER/normalization explanation, actual SQL examples and viva limits.
- `PHASE3G-REPORT.md`: this report and actual matrix below.

Existing documentation, SQL files and demo records were not edited by this phase. Other pre-existing/concurrent worktree differences were left alone; the entire Git diff is not a Phase 3G-only change list.

## Evidence artifacts

All generated runtime evidence is ignored under `.artifacts/`:

- `phase3g-baseline.json` — original row/document/object fingerprints.
- `phase3g-browser-results.json` — 28-check browser journal.
- `phase3g-browser-demos.json` — actual rendered details for all 39 browser demonstrations, including SQL/errors/before/after/rollback.
- `phase3e-trigger-results.json` — refreshed independent 39-case integration evidence.
- `phase3g-api-evidence.json` — development authorization results.
- `phase3g-production-http.json` — production read checks and seven denied endpoints.
- `phase3g-responsive.json` — 18 viewport/navigation measurements.
- `phase3g-browser-sync.json` — confirmed fixed-demo event 494.
- `phase3g-database-evidence.json` — inventory, ledger, indexes, 14 SQL examples, real EXPLAIN, joined journey and Atlas verification.
- `phase3g-follow-up.png`, `phase3g-sync-status.png`, `phase3g-sync-mobile.png`, `phase3g-sync-desktop.png` — actual browser screenshots.

## Remaining limitations and safe demo operation

- Security remains explicitly development-only. No production-ready authentication/RBAC claim is made. Test credentials are fictional local fixtures, not production secrets. The opt-in browser-test host is not a deployment command and must not be exposed publicly.
- Clearing the browser clinician session does not revoke its database session immediately; the existing one-hour expiry remains. The new fictional clinician and session are retained as test evidence; no existing identity was modified.
- Dashboard and Reports cards remain planned placeholders. medical_record and some supporting tables have no separate UI. These were not implemented as unrelated new features.
- Clinical compatibility is simplified educational evidence, not medical decision support.
- Ordinary browser workflow writes are committed; the retained journey must not be reused for another allocation/transplant. Use new fictional records for another live creation demo, or inspect it read-only and run the rollback scenario page.
- The outbox worker remains separately operated. PROCESSING row-lock ownership is normally uncommitted, so counts show committed state. Error details are local, supplementary history; failed status/attempts/retry time remain durable in MySQL. No shared distributed error store was added.
- Event/audit history is eventually consistent and has no promised per-entity delivery order or mutable clinical projection. No historical database records were normalized or rewritten.
- Browser testing covered one real Chromium-based in-app browser and two layout widths. It is not exhaustive cross-browser/device certification or a committed standalone Playwright runner; the actual executed tool steps, journal, screenshots and independent integration tests are the evidence.
- Applied migration history still reflects the earlier 007/008 reconciliation documented in Phase 3E. Do not rerun those files or the legacy DROP/CREATE scripts for the faculty presentation.

The faculty guide uses the actual installed `_tx` procedures, live index names and successfully executed SQL examples. No further migration is proposed or required by Phase 3G.

## Actual 39-scenario database matrix

Every row below also passed in the browser, with fixture absence verified after rollback. Exact errors and SQLSTATEs are retained in the evidence artifacts; accepted operations have successful before/after changes followed by rollback.

| Scenario | Exact enforcing object | Expected | Actual | MySQL result | Rollback |
|---|---|---|---|---|---|
| match-type-reject | trg_match_validate_insert | rejected | rejected | 1644/45000: Organ type does not match waiting list | True |
| match-type-accept | trg_match_validate_insert | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| approval-reject | trg_match_validate_update | rejected | rejected | 1644/45000: Latest compatibility test must be compatible | True |
| approval-accept | trg_match_validate_update | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| allocation-reject | trg_allocation_validate_insert | rejected | rejected | 1644/45000: Match is not eligible for allocation | True |
| allocation-accept | trg_allocation_validate_insert | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| reservation-reject | trg_reservation_validate_insert | rejected | rejected | 1644/45000: Invalid active organ reservation | True |
| reservation-accept | trg_reservation_validate_insert | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| permanent-record-reject | trg_transplant_record_validate_insert | rejected | rejected | 1644/45000: Transplant record organ mismatch | True |
| permanent-record-accept | trg_transplant_record_validate_insert | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| transplant-update-reject | trg_transplant_prevent_update | rejected | rejected | 1644/45000: Cannot change transplant allocation | True |
| transplant-update-accept | trg_transplant_prevent_update | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| transplant-delete-reject | trg_transplant_prevent_delete | rejected | rejected | 1644/45000: Transplant records cannot be deleted | True |
| permanent-delete-reject | trg_organ_transplant_prevent_delete | rejected | rejected | 1644/45000: Permanent transplant records cannot be deleted | True |
| organ-status-reject | trg_organ_status_validate | rejected | rejected | 1644/45000: Invalid organ status transition | True |
| organ-status-accept | trg_organ_status_validate | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| waiting-status-reject | trg_waiting_status_validate | rejected | rejected | 1644/45000: Invalid waiting list status transition | True |
| waiting-status-accept | trg_waiting_status_validate | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| priority-constraint-reject | chk_waiting_priority | rejected | rejected | 3819/HY000: Priority CHECK constraint rejected the fixture | True |
| duplicate-registration-reject | uq_active_waiting_registration | rejected | rejected | 1062/23000: Unique active-registration index rejected the fixture | True |
| match-transition-reject | trg_match_transition_guard | rejected | rejected | 1644/45000: Invalid match status transition | True |
| compatibility-insert-reject | trg_compatibility_insert_guard | rejected | rejected | 1644/45000: Testing match and active clinician required | True |
| compatibility-update-reject | trg_compatibility_immutable_update | rejected | rejected | 1644/45000: Compatibility history is append only | True |
| compatibility-delete-reject | trg_compatibility_immutable_delete | rejected | rejected | 1644/45000: Compatibility history cannot be deleted | True |
| transplant-insert-reject | trg_transplant_insert_guard | rejected | rejected | 1644/45000: Consistent reserved allocation required for transplant | True |
| follow-up-date-reject | trg_follow_up_insert_guard | rejected | rejected | 1644/45000: Valid clinician and follow up date required | True |
| procedure-allocate-accept | sp_allocate_organ_tx | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| procedure-allocate-reject | sp_allocate_organ_tx | rejected | rejected | 1644/45000: Match must be approved | True |
| procedure-release-accept | sp_release_allocation_tx | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| procedure-release-reject | sp_release_allocation_tx | rejected | rejected | 1644/45000: Active reservation not found | True |
| procedure-transplant-accept | sp_record_transplant_tx | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| procedure-transplant-reject | sp_record_transplant_tx | rejected | rejected | 1644/45000: Invalid organ or waiting-list state | True |
| allocation-evidence-reject | trg_allocation_evidence_guard | rejected | rejected | 1644/45000: Compatible clinician evidence required for allocation | True |
| allocation-evidence-accept | trg_allocation_evidence_guard | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| allocation-transition-reject | trg_allocation_transition_guard | rejected | rejected | 1644/45000: Invalid allocation identity or transition | True |
| allocation-transition-accept | trg_allocation_transition_guard | accepted | accepted | MySQL accepted the fixed SQL operation. | True |
| follow-up-update-reject | trg_follow_up_immutable_update | rejected | rejected | 1644/45000: Follow up history is append only | True |
| follow-up-delete-reject | trg_follow_up_immutable_delete | rejected | rejected | 1644/45000: Follow up history cannot be deleted | True |
| follow-up-insert-accept | trg_follow_up_insert_guard | accepted | accepted | MySQL accepted the fixed SQL operation. | True |


