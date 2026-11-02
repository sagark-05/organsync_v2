# Phase 3F Extension — MySQL-to-Atlas Business Collections

Implemented and verified on 2 November 2026, following explicit Stage 2 approval. Evidence timestamps use UTC. MySQL remains authoritative; Phase 3G functionality, safeguards, reports and earlier evidence were preserved.

## Actual result

- Initial controlled backfill: **39 approved source records**, all verified against Atlas.
- Atlas: **12 business collections**, existing `sync_events` and `audit_history`, and internal `projection_sync_state` — 15 collections in total.
- Final business state: **60 active projections and 4 tombstones**. The increase from 39 consists of authorized fictional integration/browser records, not fabricated backfill data.
- `medical_records`: **0 source rows, 0 documents**. Its empty collection exists, with a validator and index.
- Final event state: **105 DELIVERED**, no pending/processing/failed events; **105 sync_events and 103 audit_history documents**.
- All **149 original MySQL rows and 102 original Atlas event/audit documents** retained identical fingerprints. The existing **19 tables, 20 triggers and 3 procedures** and their definitions were preserved.
- **47 unit tests, 65 integration tests, 100 JS/MJS syntax checks and the production build passed.** All 39 existing database scenarios also passed again through actual browser controls with rollback evidence.

No MySQL migration, schema alteration, seed, database recreation, collection reset or production authorization change was performed. No dependency installation was needed.

## Approved mapping and actual counts

All source field names and relationships were inspected in live information_schema metadata and existing SQL/application code. Fields below are stored inside each document's `data` object; identifiers are decimal strings. Primary keys are included explicitly.

| MySQL source → Atlas collection | Primary key | Allowed data fields | Backfill | Final active | Tombstones |
|---|---|---|---:|---:|---:|
| donor → donors | donor_id | donor_id, centre_id | 6 | 9 | 4 |
| patient → patients | patient_id | patient_id, centre_id | 5 | 7 | 0 |
| organ → organs | organ_id | organ_id, donor_id, organ_type_id, centre_id, organ_status | 6 | 8 | 0 |
| waiting_list → waiting_list | waiting_id | waiting_id, patient_id, organ_type_id, centre_id, status | 5 | 7 | 0 |
| medical_record → medical_records | record_id | record_id, patient_id | 0 | 0 | 0 |
| organ_match → matches | match_id | match_id, waiting_id, organ_id, match_status | 5 | 7 | 0 |
| compatibility_test → compatibility_tests | test_id | test_id, match_id | 1 | 3 | 0 |
| organ_allocation → organ_allocations | allocation_id | allocation_id, match_id, allocation_status | 2 | 6 | 0 |
| transplant → transplants | transplant_id | transplant_id, allocation_id, centre_id | 1 | 3 | 0 |
| transplant_follow_up → transplant_follow_ups | follow_up_id | follow_up_id, transplant_id | 1 | 3 | 0 |
| transplant_centre → transplant_centres | centre_id | centre_id, is_active | 2 | 2 | 0 |
| organ_type → organ_types | organ_type_id | organ_type_id, organ_name, is_active | 5 | 5 | 0 |
| **Total** | | | **39** | **60** | **4** |

Raw donor collection count is 13: nine current records plus four deletion tombstones. Dashboard active counts intentionally exclude tombstones and incomplete claims. `organ_name` is an organ-category label, not a person's name. Source booleans are normalized to BSON booleans, and statuses are validated against the existing MySQL enums.

The existing reservation/permanent-transplant tables continue enforcing MySQL integrity and are not separate MongoDB collections. Business references remain navigable through organ → match → allocation → transplant. app_user, app_session and schema_migration are not mirrored. Existing audit/outbox handling remains separate.

## Document format and privacy

Example for the actual browser-created donor:

```json
{
  "_id": "organsync-v2:organsync_v2:donor:514",
  "source": "organsync_v2",
  "table": "donor",
  "source_id": "514",
  "schema_version": 1,
  "data": { "donor_id": "514", "centre_id": "2" }
}
```

The actual document additionally contains `_sync`: a fencing generation, state/deletion flag, content hash, server-side refresh timestamp and last notification ID when applicable. Owner/lease fields exist only while a refresh claim is held. These are explicitly internal MongoDB metadata, not MySQL columns or clinical attributes. A reconciliation refresh can replace last_event_id with null; it is diagnostic correlation, not a source-version clock.

Every new business collection has a strict JSON-schema validator, rejects extra top-level/data properties, and uses the built-in unique `_id` index plus `projection_source_state`. The source reader selects only allowed columns; it never retrieves complete donor/patient/clinical rows for projection.

Excluded: names, DOB, blood groups, sex, donor living/deceased classification, phone/contact/address details, patient city, waiting priority, medical record type/notes/timestamps, compatibility results/remarks, transplant outcome/notes/time, follow-up status/notes/date, passwords, tokens, credentials and user identity references. Centre names/contact/location details are also excluded. `performed_by` and `recorded_by` are intentionally omitted under the approved privacy exception; business-to-business foreign keys remain reference IDs.

These are minimal linkable business read models, not anonymous data or complete medical replicas. No clinical attributes were copied merely because a record was fictional.

## Backfill and preservation safeguards

Before database writes:

1. Verified the selected MySQL database was organsync_v2 and MongoDB database organsync_v2_logs.
2. Rechecked live schema, trigger/procedure inventory, and the exact 39 approved primary keys.
3. Verified Atlas contained only the existing event/audit collections and all 13 new target namespaces were absent.
4. Captured all original row/document fingerprints and live trigger/procedure definition hashes.

The approved manifest is `.artifacts/projection-approved-preflight.json`; preservation baseline is `.artifacts/phase3f-extension-baseline.json`.

The backfill rechecked the exact source IDs/counts before creating collections. It did not treat an outbox AUTO_INCREMENT maximum as a commit-order watermark. Each approved ID was read again from committed MySQL state after acquiring its document claim. Checkpoints were persisted only after the corresponding projection write was acknowledged. Replaying after a crash repeats an idempotent refresh instead of skipping an unconfirmed record.

The historical backfill job is `organsync_v2:backfill:v1`. Its verified recordsVisited result was 39. A subsequent approved invocation returns alreadyCompleted instead of resetting it or changing historical delivered outbox rows. New/current changes are handled by the worker and reconciliation, not by expanding the old approved manifest silently.

No existing event/audit documents were modified or removed. Existing `$setOnInsert` event/audit persistence remains unchanged.

## Incremental synchronization

The existing worker retains its MySQL row-lock claim, retry timestamps/backoff, crash rollback and event/audit confirmation behavior. Business projection refreshes now run after event/audit persistence and before marking the outbox row DELIVERED when ORGANSYNC_BUSINESS_PROJECTIONS=true.

| Notification | Projection targets |
|---|---|
| Donor/patient/organ/waiting-list CRUD | Corresponding source document; absence becomes tombstone |
| Match status/create, compatibility insert, follow-up insert | Corresponding source document |
| Allocation creation/release | Allocation, related organ, related waiting registration |
| Transplant completion | Transplant, allocation, organ, waiting registration |
| Authentication or fictional sync marker | Existing sanitized event/audit behavior only; no business projection |

The live procedures already emit one transactional root event for each compound workflow. Dependency expansion resolves their stable relationships and refreshes all changed business targets. No duplicate audit/outbox rows or procedure rewrites were introduced. This works with both installed procedures and existing service fallback paths.

Medical records, centres and organ types have no current application write routes/event producers. Reconciliation covers changes to those tables and direct SQL changes that bypass application producers. No unrelated CRUD workflows were added. Future write services should still emit appropriate transactional notifications; this extension does not claim direct SQL CDC.

## Fencing, stale events, deletes and recovery

- Each refresh acquires an expiring per-document claim and increments a BSON fencing generation atomically in Atlas. Lease times use MongoDB server time.
- Source data is read only after the claim is acquired. Worker source reads use the existing READ COMMITTED transaction; job reads are current autocommit lookups.
- Publishing requires the same owner/generation and an unexpired lease. An expired process cannot overwrite a newer refresh.
- Delayed notifications read current committed MySQL data, not an old payload snapshot. Event IDs and timestamps are not used as global commit-order versions.
- Writes require majority acknowledgement; business data is read back for confirmation. An integrity/ownership conflict is reported rather than overwriting another namespace/document format.
- A missing source row produces `data:null`, state deleted and deleted=true. The identity remains as a tombstone; there is no automatic TTL or destructive collection cleanup.
- Source read/network failures never mean deletion. An old create/update/delete notification cannot resurrect stale data: source presence/state is checked again.
- Partial MongoDB completion leaves the outbox event retryable. Producer commits remain intact. Multi-document updates are eventually consistent, not one distributed business transaction.

The checkpoint collection stores resumable backfill/reconciliation progress and its own expiring fenced job ownership. It contains operational metadata, not clinical documents or credentials. Counts/checkpoints are updated after confirmed writes; replay after a write/checkpoint crash is safe.

## Reconciliation

An explicit pass scans source primary keys in bounded pages, then sweeps only this source's owned projection IDs. Every sweep candidate receives a fresh source lookup; absence from a paginated scan alone never authorizes a tombstone. A new full pass catches late commits and inserts below an earlier cursor.

The CLI supports one pass or a repeating schedule with a 60-second wait between passes. Failed passes retain checkpoints and resume; completed passes start a new scan. The final explicit CLI pass completed with recordsVisited=60. Direct SQL update and delete detection, partial-pass failure and checkpoint recovery passed against real databases.

## Actual verification

| Check | Result |
|---|---|
| Historical backfill / completed-job rerun | 39 verified; rerun safely recognized completion |
| INSERT and duplicate refresh | One document per deterministic identity; allowed fields only |
| Out-of-order notifications | Older notification could not restore older source values |
| Concurrent/expired claims | Busy claim rejected; stale publisher fenced after newer refresh |
| Source lookup failure | Existing active projection retained; no false tombstone |
| Atlas outage after event persistence | FAILED outbox state, producer commit retained, recovered to DELIVERED |
| Crash after projection write before MySQL acknowledgement | Connection destroyed; event replayed without duplicate document |
| Explicit deletion and older creation notification | Tombstone retained; no resurrection |
| Allocation / release / transplant fan-out | Correct organ, registration and allocation state after each operation |
| Follow-up insertion | Only follow_up_id/transplant_id persisted |
| Reconciliation interrupted mid-pass | FAILED checkpoint resumed successfully |
| Bypassed SQL update/delete | Updated projection and later tombstone detected |
| Empty medical table | Remained empty throughout |
| Existing records / schemas | All original fingerprints and inventory passed |

Two integration executions used newly created labeled fictional fixtures. Retained projection-test journeys include donor 467/patient 891/organ 906/transplant 127/follow-up 44 and donor 472/patient 895/organ 910/transplant 128/follow-up 45. Only newly created unreferenced disposable donors 465, 466, 470 and 471 were deleted for deletion tests. Original records were never selected for modification or deletion. Their tombstones are retained.

Actual website evidence, with the worker running continuously and no manual batch button used:

- Created donor **514** through `/donors` in centre **1**. Atlas automatically stored only donor_id/centre_id under its deterministic document ID. Event **581** confirmed the delivery.
- Edited that same record through the website to centre **2**. The same Atlas document changed to centre_id=2, still exactly one document. Event **582** confirmed the update.
- The record is retained as an explicitly fictional browser-test example. Its name, birth date, blood group and donor classification were not copied to Atlas.

Browser regression checks also confirmed the Phase 3G stale-follow-up-filter fix, retained original follow-up 35/transplant 103, disabled clinical forms without a clinician session, actual audit/history monitoring, completed backfill/reconciliation, and all 39 accepted/rejected rollback SQL scenarios (14 accepted / 25 rejected). Eight management pages passed desktop/mobile navigation and overflow checks: 16 measurements. The browser journal records 15 grouped checks with no failures. No browser error/warn entries were found during final checks. The original Phase 3G journal/guide/history were preserved; no new production authentication workflow was implemented.

Automated totals:

- `npm test`: **47 passed**, including four new projection mapping/privacy tests.
- `npm run test:integration`: **65 passed, zero failures/skips**, including 11 new counted projection integration tests and all 39 existing SQL demonstrations.
- `node --check`: **100 JS/MJS files passed**; JSX compiled by Next.
- `npm run build`: final build passed, including the updated monitor and explicit Empty source label.
- Production start on temporary port 3011: sync page/API HTTP 200, real Atlas status and 12 business rows; sync POST HTTP 403.
- `npm run sync:reconcile`: real pass completed, 60 source records visited.
- Final read-only source/projection comparison: all 60 active documents matched their source fields and content fingerprints; four tombstones recorded separately.

No failed test or compilation result remains unresolved. An early unit assertion exposed platform-dependent punctuation ordering in target sorting; ordering was made explicit and the suite passed. Initial browser connection refusal was resolved by starting the app; the temporary error-page tab was not used to bypass browser policy.

## Commands and operation

The approved feature flag was added to ignored `.env.local`; existing credentials were not printed or changed. `.env.example` documents the opt-in, defaulting false for a fresh environment.

```text
# Existing independent outbox worker; set ORGANSYNC_SYNC_WORKER_ENABLED=true.
# ORGANSYNC_BUSINESS_PROJECTIONS=true enables business projection delivery.
npm run sync:worker

# Approved initial backfill: already completed. A repeat recognizes completion.
npm run sync:backfill -- --approve-backfill

# One reconciliation pass:
npm run sync:reconcile

# Repeating reconciliation, separate from the worker:
npm run sync:reconcile -- --watch

# Read-only checks:
node scripts/verify-projections.mjs
node scripts/phase3f-preservation.mjs --baseline=phase3f-extension
```

The worker was explicitly enabled for automatic browser verification. It is a separate process, not a Next.js background task or installed OS service. Keep it running when demonstrating automatic delivery. Reconciliation is independently runnable; watch mode is available but no OS scheduler was installed. Do not run concurrent test suites with a free-running worker: tests intentionally target and inspect their own events.

Backfill/reconciliation preflight requires the retained ignored approval manifest and preservation baseline. Keep those files for this approved installation. A different database/installation requires a freshly reviewed scope, not copying fingerprints or rerunning migrations. Browser-event verification scripts are intended immediately after the corresponding action, before reconciliation supersedes diagnostic event correlation.

## View the collections in Atlas

Open the Atlas project, select Cluster0/Data Explorer, then database `organsync_v2_logs` and a collection. In its Filter field, use ordinary MongoDB filters. These steps follow the official [Atlas collection-viewing](https://www.mongodb.com/docs/atlas/atlas-ui/collections/) and [query-filter documentation](https://www.mongodb.com/docs/atlas/atlas-ui/query/filter/).

Useful read-only filters:

```json
{ "source": "organsync_v2", "_sync.state": "ready", "_sync.deleted": false }
```

```json
{ "_id": "organsync-v2:organsync_v2:donor:514" }
```

```json
{ "source": "organsync_v2", "_sync.deleted": true }
```

`projection_sync_state` shows backfill/reconcile progress. `sync_events` and `audit_history` remain separate immutable history. Atlas collection-summary counts can be cached; compare the application's active/tombstone counts or `countDocuments()` with the same filter rather than assuming every physical document is an active source row. Do not edit Atlas business documents to perform application changes; make authorized changes through MySQL-backed routes.

## Files changed

- `src/lib/sync/projection-schema.js`: approved registry, normalization, deterministic IDs, validators.
- `src/lib/repositories/projection.repository.js`: allowlisted source reads, pagination and dependency resolution.
- `src/lib/sync/projections.js`: fenced projection claims/writes, tombstones and status.
- `src/lib/sync/projection-jobs.js`: fresh scope checks, controlled backfill and resumable reconciliation.
- `src/lib/sync/worker.js`: projection confirmation before acknowledgement.
- `src/lib/sync/documents.js`: sanitized projection error codes; existing event/audit formats unchanged.
- `src/lib/services/sync.service.js`: business collection/job status.
- `src/components/layout/DatabaseSyncPage.jsx`: source/active/tombstone/refresh/job monitoring.
- `scripts/sync-backfill.mjs`, `scripts/sync-reconcile.mjs`: controlled job CLIs.
- `scripts/verify-projections.mjs`, `scripts/verify-browser-projection.mjs`: read-only evidence checks.
- `tests/unit/projections.test.js`, `tests/integration/projections.test.js`: new tests.
- `tests/unit/sync.test.js`: explicit projector injection for existing isolated worker mocks.
- `package.json`, `.env.example`, ignored `.env.local`: commands and feature opt-in.
- `FACULTY-DEMO-GUIDE.md`: verified business-collection extension demonstration.
- `PHASE3F-EXTENSION-REPORT.md`: this report.

No applied SQL, core project documentation, Phase 3G report, clinician guard, existing business-service transaction or migration ledger was rewritten.

## Evidence and limitations

Final runtime check: the ordinary `npm run dev` host on port 3000 returned HTTP 200 and the browser displayed Atlas connected, all 12 business collection rows, 105 delivered events, and zero pending/processing/failed events. During cleanup, the development browser experienced repeated reloads and a connection reset while temporary verification hosts were running. Those temporary hosts were stopped and the development host restarted; the monitor then loaded successfully. The normal development host and separately authorized outbox worker were left running. No database or schema changes were needed for this recovery.

Ignored `.artifacts` evidence includes projection-approved-preflight.json, phase3f-extension-baseline.json, projection-backfill-evidence.json, projection-final-evidence.json, projection-integration-evidence.json, projection-browser-create-evidence.json, projection-browser-update-evidence.json, projection-browser-results.json, projection-browser-demos.json, projection-responsive.json, projection-dashboard-evidence.json, projection-production-evidence.json and projection-business-monitor.png. The first integration run's fixture IDs are also retained in this report; later runs intentionally update the latest integration evidence file.

Limits:

- Eventual consistency, not instantaneous or cross-collection transactional consistency. MySQL remains the source for business decisions.
- Direct SQL changes depend on reconciliation because no new database capture triggers or binlog CDC were introduced. No new MySQL migration is required by this implementation.
- IDs remain linkable. Minimal projections intentionally cannot reconstruct clinical assessments, personal profiles or clinician identities.
- Live medical-record insertion was not performed solely to populate an empty table; its schema/privacy normalization is unit-tested and its empty collection/backfill behavior is live-verified.
- Current-state refresh is not historical row-version replication. The fencing generation is not a MySQL business revision; old notifications cause fresh source reads.
- Partial initialization/leases recover through expiry/retry; new collection counts exclude unfinished claims. Tombstones have no automatic purge policy.
- Reconciliation refreshes source rows and sweeps owned IDs, so it performs repeated reads; appropriate for this academic dataset, not a claim of high-volume CDC throughput.
- Deployment supervision, production authentication/RBAC, retention policies and distributed observability remain separate work. Production HTTP writes remain blocked.
- The initial 39-record scope is a historical backfill. Future authorized records follow the same approved field policy; tests legitimately increased active counts to 60. Original records were preserved.
