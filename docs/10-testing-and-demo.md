# OrganSync V2 — Testing and Demo

## 1. Objective

Verify that OrganSync V2 correctly manages donors, patients, organs, waiting lists, compatibility assessments, allocations, and transplants.

Testing will focus on SQL correctness, database integrity, transactions, application functionality, and MongoDB synchronization.

## 2. Database Test Cases

| ID | Test Case | Expected Result |
|---|---|---|
| TC-01 | Register a valid donor | Record inserted |
| TC-02 | Insert organ with invalid donor ID | Foreign key error |
| TC-03 | Register a valid patient | Record inserted |
| TC-04 | Create duplicate active waiting-list entry | Rejected |
| TC-05 | Enter priority outside 1–5 | CHECK constraint error |
| TC-06 | Match different organ types | Rejected |
| TC-07 | Allocate the same organ twice | Second allocation rejected |
| TC-08 | Transplant an organ twice | Second transplant rejected |
| TC-09 | Record transplant without valid allocation | Rejected |
| TC-10 | Force a transaction failure | All changes rolled back |

## 3. SQL Concepts Verification

| SQL Concept | Demonstration |
|---|---|
| DDL | Show tables, primary keys, foreign keys |
| DML | INSERT, UPDATE, DELETE |
| DQL | SELECT, WHERE, ORDER BY |
| JOINs | Display organs with donor details |
| Subqueries | Find patients with active registrations |
| CTEs | Calculate organ demand |
| Aggregations | Count available organs by type |
| Views | Query `vw_available_organs` |
| Indexes | Compare query execution plans |
| Triggers | Reject invalid match records |
| Procedures | Execute organ allocation |
| Transactions | Demonstrate COMMIT and ROLLBACK |

## 4. Application Testing

- [ ] Login and logout work correctly.
- [ ] Unauthorized users cannot access restricted operations.
- [ ] Donor and patient forms validate inputs.
- [ ] Organ inventory displays MySQL records.
- [ ] Waiting-list registration prevents duplicates.
- [ ] Matching and compatibility assessment work.
- [ ] Allocation updates related records consistently.
- [ ] Transplant history and follow-ups display correctly.
- [ ] Dashboard statistics match MySQL queries.

## 5. MongoDB Testing

- [ ] MySQL changes create outbox events.
- [ ] The synchronization worker updates MongoDB Atlas.
- [ ] Reprocessing an event does not create duplicate documents.
- [ ] Failed synchronization events can be retried.
- [ ] Authentication secrets are excluded from MongoDB.
- [ ] MySQL remains correct when MongoDB is temporarily unavailable.

## 6. Faculty Demo Workflow

### Step 1 — Database Overview

Open MySQL Workbench.

Show the 19 tables, ER diagram, primary keys, foreign keys, and constraints.

### Step 2 — SQL Demonstration

Execute examples from `database/queries/`:

- JOINs
- Subqueries
- CTEs
- Aggregations
- Views
- Indexes
- Triggers
- Stored procedures
- Transactions

### Step 3 — Application Workflow

Open the OrganSync website and demonstrate:

1. Login.
2. Register a donor.
3. Add an organ.
4. Register a patient.
5. Add the patient to the waiting list.
6. Create a candidate match.
7. Record a compatibility assessment.
8. Approve the match and reserve the organ.
9. Record the transplant.
10. Add a follow-up record.
11. View updated dashboard statistics.

### Step 4 — MySQL Verification

Return to MySQL Workbench and show the records created through the website.

Demonstrate that the frontend operations update the actual relational database.

### Step 5 — MongoDB Verification

Open MongoDB Atlas and display synchronized documents and audit events.

Explain that MySQL is the primary database and MongoDB contains secondary projections.

## 7. Final Completion Checklist

- [ ] MySQL migrations execute successfully.
- [ ] All 19 tables are created.
- [ ] Foreign keys and constraints work.
- [ ] SQL queries return expected results.
- [ ] Stored procedures and triggers work.
- [ ] Transaction rollback is verified.
- [ ] Next.js application runs successfully.
- [ ] MongoDB synchronization works.
- [ ] Demo data is fictional.
- [ ] Final Git commits are pushed.
