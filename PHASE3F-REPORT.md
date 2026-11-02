# Phase 3F — MongoDB Atlas Integration

Verified on 2026-11-02. Phase 3G was not started.

## Result

MySQL `organsync_v2` remains authoritative. A separate outbox worker copies committed metadata to Atlas `organsync_v2_logs`. The live Atlas ping, writes, majority-read verification, recovery tests, existing test suites and production build passed. No MySQL migration or schema change was required or executed.

Final live evidence:

| Check | Actual result |
|---|---|
| Atlas ping and collection access | Passed |
| MySQL inventory | 19 tables, 20 triggers, 3 procedures, unchanged |
| Original MySQL rows | All 32 original row hashes unchanged |
| Original MongoDB documents | Existing `sync_events` collection was empty at baseline |
| Outbox | 27 DELIVERED; 0 PENDING, PROCESSING or FAILED |
| `sync_events` | 27 documents |
| `audit_history` | 27 documents |
| Delivered demonstration document/hash verification | All 27 matched their MySQL source events |
| Historical sanitized errors | 6, retained from intentional outage/partial-failure tests |

Fictional committed evidence event IDs:
`340, 342–349, 359, 361–368, 400, 402–409`.
These are genuine MySQL outbox IDs and Atlas documents, not simulated results. Tests intentionally retain their fictional audit/outbox markers and Atlas documents. No donor, patient, organ, allocation or transplant was added permanently for Phase 3F. Existing clinical integration fixtures continue to roll back. AUTO_INCREMENT gaps from rollback remain normal.

## Implementation and integrity

The existing schema provides status, attempt count and timestamps, but no lease-owner/expiry fields. The implementation therefore uses a row-lock claim instead of adding lease columns:

1. Open an independent MySQL transaction at READ COMMITTED.
2. Claim one eligible event using `FOR UPDATE SKIP LOCKED`.
3. Update PROCESSING and increment attempts inside that uncommitted transaction.
4. Write the event and eligible entity audit history to Atlas.
5. Require majority acknowledgement and read back every expected document field.
6. Only after confirmation, mark DELIVERED and commit MySQL.

On Atlas failure the worker commits FAILED with a retry timestamp, retaining the committed producer transaction. Failed attempts back off exponentially (4 seconds after the first failed attempt, then 8, 16, etc., capped at 300 seconds). There is no retry cutoff that could silently discard an event. Other eligible events can still proceed.

Concurrent workers skip locked rows. A worker crash/disconnected MySQL connection releases its lock and rolls back its uncommitted claim. A replay after Atlas persistence and before MySQL acknowledgement is safe. Legacy committed PROCESSING rows are also eligible for recovery through the same lock. An ambiguous MySQL commit is reported as uncertain; the next worker pass reads the actual durable state.

Business writes and producer audit/outbox commits are separate from delivery transactions. The outage test confirmed that a committed producer marker and its audit row remained present while delivery failed, then recovered. No production clinical transaction was deliberately failed or changed.

This is at-least-once delivery with idempotent document persistence, not a distributed transaction. Per-entity ordering is not promised; the collections store immutable history, not mutable business projections.

## Collections and privacy

| Collection | Purpose | Identity |
|---|---|---|
| `sync_events` | Sanitized immutable outbox metadata | `_id = organsync-v2:<source>:outbox:<event_id>` |
| `audit_history` | Sanitized independently identified entity audit history | `_id = organsync-v2:<source>:audit:<audit_id>` |

The built-in unique `_id` index prevents duplicates. Upserts use only `$setOnInsert`; existing documents are never replaced or updated. Conflicting existing content produces a retryable integrity error instead of overwriting it. Both collections are created only when needed; `audit_history` was created by the application during verification. No additional read-model collection was necessary.

Payloads use an explicit entity/ID/action allowlist. Names, birth dates, addresses, notes, contact information, passwords, tokens and credentials are omitted. Authentication entities receive a redacted event marker without aggregate ID or payload; their audit identities are not copied. Audit actors (`user_id`) are excluded. BIGINT IDs remain decimal strings and unsafe numeric IDs are rejected.

MySQL has no audit-to-outbox foreign key. The worker mirrors independently identified audit history for the event's entity; it does not invent a one-to-one relationship. There is no unrelated historical audit backfill.

Atlas configuration comes from ignored `.env.local`. TLS, certificate and hostname verification remain enabled. Network timeouts, majority write concern and majority read concern are configured. No URI, password, raw database exception or SQL is returned through the synchronization API or error log.

## Pages and API

- `/database-sync`: responsive status page linked from the homepage and shared module navigation. Shows committed outbox counts/history, Atlas connectivity, collection counts, recent synchronized events and sanitized error history.
- `GET /api/database-sync`: read-only status; `Cache-Control: no-store`.
- `POST /api/database-sync`: fixed `{action:"demo"|"run", confirm:true}` actions. No arbitrary SQL, payload or event ID is accepted.
- `demo`: commit one random fictional `sync_demo` audit/outbox metadata marker, then synchronize that exact server-created event.
- `run`: synchronize at most 10 eligible queued events.

Both POST actions reuse the local development write guard, same-origin/loopback checks and bearer token. They additionally require `ORGANSYNC_DEV_SYNC=true` and explicit confirmation. Production HTTP writes remain blocked. The token remains in page memory. No clinician identity or authentication bypass is introduced.

Tables accessed by Phase 3F application code: `sync_outbox` (claim/status/delivery state) and `audit_log` (producer marker and audit reads). Verification additionally reads information_schema and all original tables to compare hashes. No existing business service write path was changed.

## Files created or modified in this phase

- `.env.example`: Atlas placeholders, stable source ID and explicit worker/demo opt-ins.
- `package.json`: `sync:worker` command; installed dependencies preserved.
- `src/lib/db/mongodb.js`: lazy pooled Atlas client and shutdown helper.
- `src/lib/repositories/sync.repository.js`: atomic row claim, retry selection, audit/status queries.
- `src/lib/services/sync.service.js`: status and fictional committed demonstration orchestration.
- `src/lib/api/sync.js`: guarded fixed synchronization actions.
- `src/lib/sync/worker.js`: delivery, retry, acknowledgement and recovery orchestration.
- `src/lib/sync/atlas-sink.js`: create-on-demand collections, immutable idempotent writes and read-back verification.
- `src/lib/sync/documents.js`: stable IDs, sanitization and safe error codes.
- `src/lib/sync/errors.js`: bounded error-history reads and sanitized local logging.
- `src/app/api/database-sync/route.js`: Node runtime, dynamic API route.
- `src/app/database-sync/page.jsx`: page entry.
- `src/components/layout/DatabaseSyncPage.jsx`: dashboard and authorized demonstration controls.
- `src/components/layout/ModuleNavigation.jsx`: synchronization link.
- `src/app/page.jsx`: homepage synchronization link.
- `src/app/globals.css`: responsive synchronization styling.
- `scripts/sync-worker.mjs`: explicitly enabled standalone worker, one-shot/polling modes.
- `scripts/phase3f-preservation.mjs`: read-only original-record/object hash verification.
- `scripts/verify-phase3f.mjs`: read-only live Atlas delivery evidence verification.
- `tests/unit/sync.test.js`: nine new unit tests.
- `tests/integration/sync.test.js`: nine real database subtests plus parent test.
- `PHASE3F-REPORT.md`: this report.

No existing documentation, SQL migration, seed or query file was edited in this phase. Existing unrelated worktree changes and tracked build artifacts were preserved. The official MongoDB driver was already installed; no dependency installation was needed.

## Commands and validation

| Command/check | Result |
|---|---|
| Initial read-only Atlas ping and collection inspection | Passed before implementation writes |
| `node scripts/phase3f-preservation.mjs --capture` | Captured 32 original MySQL row hashes, zero original Mongo documents and database object hashes in ignored `.artifacts` |
| `npm test` | 43 passed, 0 failed |
| `npm run test:integration` | 53 passed, 0 failed, 0 skipped |
| `node --check` over all JS/MJS in lib, API, scripts and tests | 88 files passed; JSX compiled by Next build |
| `npm run build` | Final production build passed; `/database-sync` and `/api/database-sync` included |
| `node scripts/phase3f-preservation.mjs` | All original records and inventory/trigger/procedure hashes unchanged |
| `node scripts/verify-phase3f.mjs` | Live Atlas ping and all 27 delivered demonstration documents verified |
| `npm run sync:worker -- --once` with explicit process opt-in | Passed; idle queue |
| `npm run start -- -p 3001` | Ready; production start passed |
| HTTP `/database-sync` and `/` | 200; synchronization heading/link present |
| HTTP `GET /api/database-sync` | 200; connected Atlas and actual outbox counts |
| HTTP production `POST /api/database-sync` | 403, as required |

New live integration coverage:

| Scenario | Actual result |
|---|---|
| Committed event plus audit delivery | DELIVERED, exactly one document per ID |
| Direct duplicate replay | Existing immutable documents retained; no duplicate |
| Uncommitted producer | Worker idle; no uncommitted event copied |
| Actual MongoDB driver connection outage | FAILED, committed producer/audit retained, backoff enforced, retry delivered |
| Partial failure after actual event persistence | Retry filled audit history without duplicating event |
| Two workers targeting one locked event | Second worker idle; one delivery attempt |
| Connection destroyed after Atlas persistence | Lock released; polling replay delivered exactly once by stable ID |
| Stale committed PROCESSING row | Recovered to DELIVERED |
| Concurrent different events | Both delivered |
| Development API guard/confirmation/input restrictions | Unauthorized actions rejected; authorized fictional demo delivered |

Outage testing used the real official driver against an unreachable loopback endpoint with TLS still enabled; Atlas network access settings were not changed. The partial-failure test explicitly injected an error after a real Atlas event write. Atlas itself remained reachable during these controlled failure tests.

An initial crash test expected lock release immediately after socket destruction. MySQL can release it asynchronously; the corrected test verifies bounded polling recovery, matching the worker loop. Its fictional event was recovered. The first sandbox build encountered a Windows junction permission error; the final build outside that sandbox passed. A PowerShell HTTP-check variable-name conflict was corrected and the check passed. No unresolved compilation or test failures remain.

The existing Phase 3D suite still reports that no permanent active clinician exists; its legacy positive clinician path is conditional. Phase 3E's rollback clinician setup and clinical workflow test passed. No permanent clinician was fabricated.

## Operation and remaining limitations

Existing `.env.local` Atlas configuration was used without modification. To run continuous delivery, explicitly set `ORGANSYNC_SYNC_WORKER_ENABLED=true` in the local environment and run:

```text
npm run sync:worker
# For a single bounded batch:
npm run sync:worker -- --once
```

Keep `ORGANSYNC_SYNC_SOURCE` stable and unique for this authoritative database. Do not change it after delivery without a separately reviewed reconciliation plan.

For website demonstration, run `npm run dev`, configure existing `ORGANSYNC_DEV_WRITES=true` and a 32+ character development token, additionally opt in with `ORGANSYNC_DEV_SYNC=true`, open `/database-sync`, enter the token and check the authorization box. No permanent opt-in was silently added to `.env.local`. Production website writes remain disabled.

Limitations:

- The worker is a separate process, not automatically started by Next.js. Deployment scheduling/process supervision remains operational setup; it is not an in-process background task in a serverless route.
- A MySQL row lock is held during Atlas calls, avoiding schema changes. This is suitable for the academic workload; very large audit histories increase lock duration and would merit a separately approved lease/batching design.
- PROCESSING is normally uncommitted while a worker owns a row, so status counts show committed state rather than all live claims.
- FAILED status, attempt count and retry time are durable in MySQL. Detailed sanitized error history is local `.artifacts/sync-errors.jsonl`, not shared between worker hosts; it is supplementary and not required for recovery.
- No automatic deletion, retention policy, historic full backfill, mutable business projection or MongoDB-to-MySQL write path was implemented.
- Browser click-through/visual inspection was not automated; the built page and live HTTP API were smoke-tested, and the guarded demonstration handler was exercised against real databases.
- Integration tests intentionally commit fictional metadata and keep that evidence. Repeat runs add more such records. Preservation hashes permit new rows while verifying every original row remains unchanged.

Architecture follows `docs/08-system-architecture.md`. No documentation/schema conflict required a change. No SQL migration approval is needed for this phase. Phase 3G remains untouched.
