# OrganSync V2 report validation

Date: 17 November 2026. Output: `OrganSync_V2_DBMS_Mini_Project_Report.docx`.

## Completed structure

Cover, certificate, declaration, acknowledgement, abstract, automatic table of contents, list of tables and list of figures; Chapters 1–9 (Introduction; Problem Definition; ER Model; ER to Relational Mapping, including 4.1 and 4.2; DDL Statements; DML Statements; Queries with all five required subsections; Stored Procedures, Functions and Triggers; Front End Development); bibliography; Appendix A; verified GitHub repository link.

Both students and SRNs are consistent: Sagar K — PES2UG24CS424; S Vinyas Gangadkar — PES2UG24CS418. Guide: Prof. Vinu J. Course: UE24CS351A. Institution, campus and AUG–DEC 2026 semester are included.

## Evidence included

- Eleven genuine browser screenshots captured automatically from the running existing production build: homepage, donors, patients, organs, matching, compatibility, allocation/transplant interface, transplant controls, follow-up history, database demonstration catalogue and database synchronisation monitor. Files are under `assets/frontend-*.png`. Provenance: `assets/browser-evidence.json`.
- Donor, patient and organ lists were filtered to fictional records. Existing fictional compatibility and follow-up evidence was viewed. No authorisation fields were populated and no business operation was submitted.
- The supplied ER and relational-mapping PDFs were rasterised and retained with explicit conceptual/incomplete labels. A schema-derived core relationship supplement and four complete mapping panels cover all nineteen tables. Eighteen numbered figures and twelve numbered tables are included; two additional embedded images are the genuine PES logo from the reference document.
- Authentic DDL, seed insertion, update, reservation deletion, transaction, correlated/nested queries, CTE and trigger/procedure excerpts come from existing SQL files. SQL comments and blank lines are omitted in some listings for readability. No source SQL was changed.
- Fresh real MySQL evidence: read-only transaction, information_schema inventory, aggregate availability, outbox status and EXPLAIN. Raw results: `assets/sql-readonly-evidence.json`. Successful inventory: nineteen base tables, seven views, twenty triggers, three transaction-safe procedures. Aggregate available inventory: Heart 3, Kidney 2, Liver 2, Lung 2, Pancreas 0. Snapshot timestamp: 17 November 2026, 16:15 UTC.
- Historical actual MySQL demonstrations are attributed to `.artifacts/phase3g-browser-demos.json`, dated 1 November 2026. The report lists the retained scenarios, exact enforcing objects and actual success/error messages, including rollback evidence. Historical runs are not represented as new executions.
- Previously stored frontend screenshots were reviewed; fresh captures were preferred to avoid presenting older queue counts as current. Existing diagram assets and logo were reused directly.

## Diagram/schema differences

The two supplied PDFs describe nine earlier conceptual entities. DONAR becomes donor; REGISTRATION becomes waiting_list; MATCH becomes organ_match. Implemented keys include donor_id, waiting_id and match_id. The drawings omit organ_type, organ_allocation, transplant_follow_up, active_organ_reservation, organ_transplant_record, app_user, app_session, audit_log, sync_outbox and schema_migration. Attributes such as match score, centre licence, organ condition and direct organ blood group are not actual implemented columns. Transplant links through allocation; follow-ups are separate records. The corrected mapping and full FK inventory explain these differences rather than silently treating the originals as the complete schema.

## Validation performed

- Inspected repository SQL, documentation, source, tests, scripts, faculty guide and retained evidence. A 152-file SHA-256 inventory is retained in `.qa/source-inventory.json`; the final comparison found no changes to those existing files.
- Started the existing production build with `npm run start -- -p 3000`; actual frontend navigation succeeded. No rebuild, seed, migration, worker, reconciliation or integration fixture execution was required for report collection.
- Read-only MySQL queries succeeded. No MySQL or MongoDB data modification was performed.
- Opened, refreshed automatic contents/caption lists and saved the DOCX using Microsoft Word. Exported the final 48-page document to PDF for visual QA and rendered all pages to PNG under `.qa/rendered/`. Contact sheets and selected full-size pages were inspected for clipping, missing figures and table overflow; final structural checks found no empty pages.
- The prescribed `render_docx.py` route was attempted on the reference, but LibreOffice/soffice is unavailable. Microsoft Word rendering was used instead, with genuine page images; no unverified layout claim is based on XML alone.
- Team details, required headings, captions and embedded figure count were checked. Original sample-project text was removed with replacement of the editable template body; the original template remains untouched. Word field values are refreshed, not empty placeholders.
- Existing README modifications and the untracked original template were preserved. No commits, pushes or Git-history changes were made. New work is confined to `reports/`.

## Missing evidence and remaining submission issues

- No fresh screenshots of DDL execution, UPDATE/DELETE execution, new allocation, new transplant, clinician login/setup or newly executed trigger demonstrations: these would require state-changing operations beyond read-only evidence collection. Authentic SQL and dated historical results are provided instead. The allocation/transplant screenshots demonstrate the available guarded interface, not a newly completed transaction.
- No standalone Dashboard screenshot: Dashboard and Reports remain planned homepage entries. No separate waiting-list screenshot was captured; its actual relational workflow is documented through source, mapping and matching evidence.
- No fresh unit/integration suite was executed because integration suites create fictional fixtures and mutate state. Historical test totals are not claimed as current verification.
- Separate PHASE3E/3F/3G and extension reports referenced in earlier history are absent from this checkout. Retained evidence artifacts, source and the faculty guide were used instead.
- The fresh outbox snapshot contains 41 pending and 5 failed events alongside 105 delivered events. No worker was run to alter this snapshot. This is an operational limitation, not a fully synchronised-state claim. No new direct Atlas ping was performed for this report.
- Certificate/declaration signatures and dates remain intentionally blank for the students and authorised faculty. They are signature spaces, not unresolved technical placeholders.
- The conceptual originals remain older simplified diagrams by design; their corrected supplements should be used when explaining the complete implemented model.

The report artifact is complete and opens successfully. It is not claimed unconditionally submission-ready until the faculty accepts the explicitly labelled historical/read-only evidence in place of new state-changing execution screenshots and the required physical signatures are completed.
