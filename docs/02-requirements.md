# OrganSync V2 — Requirements

## 1. Project Overview

OrganSync V2 is an Organ Donation and Transplant Management System that manages donors, patients, organ availability, waiting lists, compatibility assessments, allocations, and transplant records.

The system uses **Next.js, MySQL 8.x, and MongoDB Atlas**.

## 2. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | Register and manage donors. |
| FR-02 | Register and manage patients. |
| FR-03 | Manage transplant centres. |
| FR-04 | Register donated organs and track availability. |
| FR-05 | Maintain patient waiting lists and priorities. |
| FR-06 | Create candidate organ-patient matches. |
| FR-07 | Record compatibility assessments. |
| FR-08 | Approve or reject candidate matches. |
| FR-09 | Reserve available organs for approved matches. |
| FR-10 | Release existing organ reservations. |
| FR-11 | Record completed transplants. |
| FR-12 | Maintain transplant follow-up records. |
| FR-13 | Generate dashboard statistics and reports. |
| FR-14 | Provide user authentication and role-based access. |
| FR-15 | Maintain audit logs for important operations. |
| FR-16 | Synchronize selected records with MongoDB Atlas. |

## 3. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Secure authentication, password hashing, and role-based authorization |
| Data Integrity | Enforce primary keys, foreign keys, uniqueness, and CHECK constraints |
| Reliability | Use ACID transactions for critical operations |
| Performance | Use indexes for frequently executed queries |
| Usability | Provide a responsive and easy-to-use interface |
| Maintainability | Separate SQL migrations, backend logic, and frontend components |
| Consistency | Keep MySQL authoritative and synchronize MongoDB asynchronously |
| Auditability | Record important database operations |
| Error Handling | Validate inputs and provide meaningful error messages |
| Testability | Support repeatable database, API, and integration tests |

## 4. User Roles

| Role | Responsibilities |
|---|---|
| ADMIN | Manage users, centres, and system administration |
| COORDINATOR | Manage donors, patients, waiting lists, and allocations |
| CLINICIAN | Record compatibility assessments and transplant follow-ups |

Permissions are enforced by the backend, not only through frontend controls.

## 5. Main Workflow

```text
Register Donor → Add Organ
                       |
Register Patient → Waiting List
                       |
                       v
              Candidate Matching
                       |
              Compatibility Test
                       |
                Match Approval
                       |
               Organ Allocation
                       |
                  Transplant
                       |
                   Follow-up
```

## 6. Database Requirements

**MySQL:** Store relational records using normalized tables, foreign keys, constraints, views, triggers, stored procedures, and transactions.

**MongoDB Atlas:** Store selected synchronized document projections and audit events through a transactional outbox worker.

MySQL remains the primary source of truth.

## 7. Project Scope

The system is an **educational prototype** using fictional data.

Organ compatibility and waiting-list priority rules are simplified and are not clinically validated. The application is not intended for real medical decision-making.
