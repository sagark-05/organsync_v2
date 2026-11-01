# OrganSync V2 — SQL Concepts

## 1. Overview

OrganSync V2 uses **MySQL 8.x** as its primary relational database. SQL concepts are implemented through donor registration, organ inventory, waiting-list management, compatibility matching, allocation, and transplantation.

## 2. SQL Concepts and Applications

| SQL Concept | Implementation in OrganSync |
|---|---|
| DDL | Create 19 relational tables |
| DML | Insert, update, and delete records |
| DQL | Retrieve donor, patient, and organ information |
| Primary & Foreign Keys | Maintain relationships and referential integrity |
| Constraints | Enforce uniqueness, valid priorities, and data integrity |
| JOINs | Combine donor, organ, patient, and matching data |
| Subqueries | Find patients with active waiting-list entries |
| CTEs | Analyze organ demand |
| Aggregate Functions | Count available organs and waiting patients |
| Views | Provide reusable inventory and reporting queries |
| Indexes | Optimize frequently executed queries |
| Triggers | Reject invalid database operations |
| Stored Procedures | Perform organ allocation and transplantation |
| Transactions | Ensure atomic updates and rollback |
| Normalization | Organize relational data up to 3NF |

## 3. Example SQL Queries

### JOIN — Organ Details

```sql
SELECT o.organ_id, ot.organ_name,
       d.full_name AS donor_name
FROM organ o
JOIN donor d ON o.donor_id = d.donor_id
JOIN organ_type ot
  ON o.organ_type_id = ot.organ_type_id;
```

### Subquery — Active Waiting Patients

```sql
SELECT patient_id, full_name
FROM patient
WHERE patient_id IN (
    SELECT patient_id
    FROM waiting_list
    WHERE status = 'ACTIVE'
);
```

### CTE — Organ Demand

```sql
WITH demand AS (
    SELECT organ_type_id, COUNT(*) AS total
    FROM waiting_list
    WHERE status = 'ACTIVE'
    GROUP BY organ_type_id
)
SELECT * FROM demand;
```

### Aggregation — Available Organs

```sql
SELECT organ_type_id, COUNT(*) AS available
FROM organ
WHERE organ_status = 'AVAILABLE'
GROUP BY organ_type_id;
```

## 4. Advanced Database Features

**Views:** Reusable queries for organ inventory, waiting lists, and transplant reports.

**Indexes:** Improve performance when searching organs, patients, and waiting-list entries.

**Triggers:** Prevent invalid matching operations and enforce database rules.

**Stored Procedures:**
- `sp_allocate_organ` — Reserve an available organ for an approved match.
- `sp_release_allocation` — Release an existing reservation.
- `sp_record_transplant` — Complete the transplantation process.

**Transactions:** Use COMMIT, ROLLBACK, and row-level locking to prevent inconsistent allocations and duplicate transplants.

## 5. SQL Implementation Files

```text
database/
├── migrations/
│   ├── 001_schema.sql
│   ├── 002_constraints.sql
│   ├── 003_indexes.sql
│   ├── 004_views.sql
│   ├── 005_triggers.sql
│   └── 006_procedures.sql
└── queries/
    ├── crud.sql
    ├── joins.sql
    ├── subqueries.sql
    ├── ctes.sql
    ├── aggregations.sql
    └── transactions.sql
```

## 6. Database Verification

SQL implementation will be verified through MySQL Workbench by testing CRUD operations, JOINs, subqueries, constraints, triggers, stored procedures, and transaction rollback.

**MySQL remains the source of truth**, while MongoDB Atlas stores selected synchronized records and audit events.
