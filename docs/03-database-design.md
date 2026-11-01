# OrganSync V2 — Database Design

## 1. Overview

OrganSync V2 uses **MySQL 8.x** as its primary database, with 19 relational tables designed to maintain data integrity and support organ donation and transplantation workflows.

The schema targets Third Normal Form (3NF).

## 2. Database Tables

| No. | Table | Purpose |
|---|---|---|
| 1 | `transplant_centre` | Stores registered transplant centres |
| 2 | `app_user` | Stores users and roles |
| 3 | `donor` | Stores donor information |
| 4 | `patient` | Stores patient information |
| 5 | `organ_type` | Stores supported organ types |
| 6 | `organ` | Tracks donated organs and availability |
| 7 | `waiting_list` | Tracks patients awaiting organs |
| 8 | `medical_record` | Stores patient assessments |
| 9 | `organ_match` | Connects waiting-list entries with organs |
| 10 | `compatibility_test` | Records compatibility assessments |
| 11 | `organ_allocation` | Tracks organ reservations |
| 12 | `transplant` | Records transplantation procedures |
| 13 | `transplant_follow_up` | Stores post-transplant follow-ups |
| 14 | `audit_log` | Records important system activities |
| 15 | `app_session` | Manages authenticated sessions |
| 16 | `sync_outbox` | Stores MongoDB synchronization events |
| 17 | `schema_migration` | Tracks applied SQL migrations |
| 18 | `active_organ_reservation` | Prevents multiple active organ reservations |
| 19 | `organ_transplant_record` | Prevents duplicate organ transplantation |

## 3. Key Relationships

| Relationship | Cardinality |
|---|---|
| Transplant Centre → Donors / Patients | One-to-Many |
| Donor → Organs | One-to-Many |
| Organ Type → Organs | One-to-Many |
| Patient → Waiting List | One-to-Many |
| Waiting List → Organ Matches | One-to-Many |
| Organ → Organ Matches | One-to-Many |
| Organ Match → Compatibility Tests | One-to-Many |
| Organ Match → Allocations | One-to-Many |
| Allocation → Transplant | One-to-Zero-or-One |
| Transplant → Follow-ups | One-to-Many |
| Organ → Active Reservation | One-to-Zero-or-One |
| Organ → Transplant Record | One-to-Zero-or-One |

## 4. Database Integrity

- Primary keys uniquely identify records.
- Foreign keys enforce relationships.
- UNIQUE constraints prevent duplicate reservations and transplants.
- CHECK constraints validate values such as waiting-list priority.
- Triggers enforce cross-table business rules.
- Stored procedures and transactions handle allocation and transplantation.

The `organ_allocation` table stores `match_id`, avoiding duplication of `organ_id`.

## 5. Database Technologies

**MySQL:** Authoritative relational records, constraints, SQL queries, and transactions.

**MongoDB Atlas:** Selected synchronized projections and audit events.

Synchronization uses a transactional outbox to avoid losing events when MongoDB is temporarily unavailable.

## 6. Implementation

The database will be implemented using versioned SQL scripts in `database/migrations/`.

The complete column definitions, data types, foreign keys, and constraints will be maintained in those executable migration files.
