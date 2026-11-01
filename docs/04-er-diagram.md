# OrganSync V2 — ER Diagram

## 1. Overview

The OrganSync V2 database contains **19 relational tables**. The ER diagram represents the relationships between donors, patients, organs, waiting lists, matches, allocations, and transplants.

## 2. Core ER Diagram

```mermaid
erDiagram
    TRANSPLANT_CENTRE ||--o{ DONOR : registers
    TRANSPLANT_CENTRE ||--o{ PATIENT : registers
    TRANSPLANT_CENTRE ||--o{ ORGAN : manages
    TRANSPLANT_CENTRE ||--o{ WAITING_LIST : manages
    TRANSPLANT_CENTRE ||--o{ TRANSPLANT : performs

    DONOR ||--o{ ORGAN : donates
    ORGAN_TYPE ||--o{ ORGAN : classifies

    PATIENT ||--o{ WAITING_LIST : joins
    PATIENT ||--o{ MEDICAL_RECORD : has
    ORGAN_TYPE ||--o{ WAITING_LIST : requested_for

    WAITING_LIST ||--o{ ORGAN_MATCH : considered_in
    ORGAN ||--o{ ORGAN_MATCH : considered_in

    ORGAN_MATCH ||--o{ COMPATIBILITY_TEST : evaluated_by
    ORGAN_MATCH ||--o{ ORGAN_ALLOCATION : allocated_through

    ORGAN_ALLOCATION ||--o| TRANSPLANT : results_in
    TRANSPLANT ||--o{ TRANSPLANT_FOLLOW_UP : has

    ORGAN ||--o| ACTIVE_ORGAN_RESERVATION : reserves
    ORGAN_ALLOCATION ||--o| ACTIVE_ORGAN_RESERVATION : identifies

    ORGAN ||--o| ORGAN_TRANSPLANT_RECORD : records
    TRANSPLANT ||--o| ORGAN_TRANSPLANT_RECORD : identifies
```

## 3. Supporting Tables

The following tables support authentication, auditing, and synchronization.

```mermaid
erDiagram
    TRANSPLANT_CENTRE ||--o{ APP_USER : employs
    APP_USER ||--o{ APP_SESSION : has
    APP_USER ||--o{ MEDICAL_RECORD : records
    APP_USER ||--o{ COMPATIBILITY_TEST : performs
    APP_USER ||--o{ TRANSPLANT_FOLLOW_UP : records
    APP_USER |o--o{ AUDIT_LOG : performs

    SYNC_OUTBOX {
        bigint event_id PK
        varchar aggregate_type
        bigint aggregate_id
        varchar event_type
        json payload
    }

    SCHEMA_MIGRATION {
        varchar version PK
        varchar description
        datetime applied_at
    }
```

## 4. Important Relationships

- One donor can provide multiple organs.
- One patient can have multiple waiting-list registrations for different organ types.
- Each match connects one organ to one waiting-list registration.
- One match can have multiple compatibility assessments.
- One allocation can result in at most one transplant.
- Each organ can have at most one active reservation.
- Each organ can have at most one permanent transplant record.

## 5. Design Notes

- Foreign keys maintain referential integrity.
- The schema is designed to follow 3NF.
- `active_organ_reservation` prevents concurrent active reservations.
- `organ_transplant_record` prevents duplicate transplantation.
- `sync_outbox` supports asynchronous synchronization with MongoDB Atlas.
- Full column definitions and constraints are implemented in the SQL migration files.
