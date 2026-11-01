# OrganSync V2 — Business Rules

## 1. Overview

OrganSync V2 manages organ donation and transplantation through database constraints, triggers, stored procedures, and transactions.

MySQL enforces data integrity and prevents invalid allocations or duplicate transplants.

## 2. Core Business Rules

| ID | Business Rule |
|---|---|
| BR-01 | Every organ must belong to a registered donor. |
| BR-02 | Every donor and patient must be associated with a transplant centre. |
| BR-03 | Each organ must have a valid organ type. |
| BR-04 | Waiting-list priority must be between 1 and 5. |
| BR-05 | A patient cannot have duplicate ACTIVE or MATCHED registrations for the same organ type. |
| BR-06 | A candidate match must have the same organ type as the waiting-list request. |
| BR-07 | Only approved matches with a latest COMPATIBLE assessment can proceed to allocation. |
| BR-08 | Only AVAILABLE organs can be allocated. |
| BR-09 | An organ cannot have multiple active reservations. |
| BR-10 | An organ cannot be transplanted more than once. |
| BR-11 | Transplantation requires a valid RESERVED allocation. |
| BR-12 | Critical operations must execute within MySQL transactions. |
| BR-13 | Important operations must generate audit and synchronization events. |

Compatibility assessment is simplified for educational demonstration and is not clinically validated.

## 3. Status Transitions

| Entity | Allowed Transitions |
|---|---|
| Organ | AVAILABLE → RESERVED / DISCARDED |
| Organ | RESERVED → AVAILABLE / TRANSPLANTED |
| Waiting List | ACTIVE → MATCHED / CANCELLED |
| Waiting List | MATCHED → ACTIVE / COMPLETED / CANCELLED |
| Match | PROPOSED → TESTING / REJECTED / CANCELLED |
| Match | TESTING → APPROVED / REJECTED / CANCELLED |
| Allocation | RESERVED → RELEASED / COMPLETED |

Completed and discarded records cannot return to active states. An approved match can be cancelled only when it has no active or completed allocation.

## 4. Database Integrity

OrganSync uses **19 relational tables**, including two dedicated integrity tables:

| Table | Purpose |
|---|---|
| `active_organ_reservation` | Prevent multiple active allocations for one organ |
| `organ_transplant_record` | Permanently prevent duplicate transplantation |

The `organ_allocation` table references `match_id` rather than storing a redundant `organ_id`.

Database constraints and controlled procedures ensure that reservation and transplant records refer to the correct organ.

## 5. Critical Transactions

**Organ Allocation**

1. Validate approved match, compatibility, and availability.
2. Lock relevant database records.
3. Create allocation and active reservation.
4. Update organ and waiting-list statuses.
5. Record audit and synchronization events.
6. Commit or roll back all changes.

**Allocation Release**

Release the reservation, restore eligible statuses, and record the operation within one transaction.

**Transplant Completion**

Validate the reservation, create the transplant and permanent organ record, update related statuses, remove the active reservation, and commit atomically.

## 6. Security and Synchronization

- ADMIN, COORDINATOR, and CLINICIAN roles control access.
- Backend APIs enforce authorization.
- Foreign keys protect historical relationships.
- Parameterized SQL prevents SQL injection.
- MySQL is the primary database.
- MongoDB Atlas receives selected records through a transactional outbox worker.
- Password hashes, session tokens, and unnecessary sensitive data are excluded from synchronization.

## 7. Verification

The following cases must be tested:

- Invalid foreign keys and waiting-list priorities.
- Duplicate active waiting-list registrations.
- Matching different organ types.
- Allocating an unavailable or already reserved organ.
- Attempting duplicate transplantation.
- Failed transactions and rollback.
- Concurrent allocation requests.
- MongoDB synchronization retries.
