# OrganSync V2 — Implementation Plan

## 1. Objective

Build a working Organ Donation and Transplant Management System using MySQL, Next.js, and MongoDB Atlas, with SQL as the primary focus.

## 2. Implementation Phases

### Phase 1 — Database Design

- [x] Define project requirements.
- [x] Design the proposed relational schema.
- [x] Prepare the ER diagram.
- [x] Analyze normalization.
- [x] Define business rules and SQL concepts.
- [ ] Update the schema and ER diagram to include the final 19-table design.

### Phase 2 — MySQL Implementation

- [ ] Create the `organsync_v2` database.
- [ ] Implement all 19 tables.
- [ ] Add primary keys, foreign keys, and constraints.
- [ ] Create indexes and views.
- [ ] Implement triggers and stored procedures.
- [ ] Insert fictional demonstration data.
- [ ] Test joins, subqueries, CTEs, aggregations, and transactions.

**Deliverable:** A working MySQL database with organized `.sql` files.

### Phase 3 — Backend Development

- [ ] Initialize the Next.js project.
- [ ] Configure the MySQL connection pool.
- [ ] Implement authentication and role-based authorization.
- [ ] Create API routes for database operations.
- [ ] Implement repository and service layers.
- [ ] Connect critical workflows to stored procedures.
- [ ] Validate requests and handle database errors.

**Deliverable:** Working APIs connected to MySQL.

### Phase 4 — Frontend Development

- [ ] Build login and dashboard pages.
- [ ] Implement donor and patient management.
- [ ] Implement organ inventory and waiting lists.
- [ ] Build compatibility matching and allocation workflows.
- [ ] Implement transplant and follow-up pages.
- [ ] Create reports and statistics.

**Deliverable:** A responsive web application.

### Phase 5 — MongoDB Atlas Integration

- [ ] Configure a separate MongoDB database.
- [ ] Implement the transactional outbox worker.
- [ ] Synchronize approved donor, patient, organ, and transplant projections.
- [ ] Store audit events.
- [ ] Implement retry and duplicate-event protection.
- [ ] Verify synchronization after MySQL changes.

**Deliverable:** Reliable MySQL-to-MongoDB synchronization.

### Phase 6 — Testing and Demonstration

- [ ] Test CRUD operations.
- [ ] Verify foreign-key and uniqueness constraints.
- [ ] Test triggers and stored procedures.
- [ ] Demonstrate transaction rollback.
- [ ] Test authentication and authorization.
- [ ] Verify frontend and backend integration.
- [ ] Verify MongoDB synchronization.
- [ ] Prepare the final faculty demo.

**Deliverable:** A tested application with reproducible database demonstrations.

## 3. Implementation Order

```text
Database Design
      ↓
MySQL Schema
      ↓
Constraints and SQL Features
      ↓
Demo Data and Database Tests
      ↓
Backend APIs
      ↓
Frontend Interface
      ↓
MongoDB Synchronization
      ↓
Final Testing and Demo
```

## 4. Development Rules

- Keep the existing OrganSync V1 project unchanged.
- Use a separate MySQL database named `organsync_v2`.
- Maintain database changes through versioned SQL migrations.
- Never store credentials in Git.
- Commit completed, tested milestones.
- Use fictional donor and patient data only.
- Treat all matching and prioritization rules as educational and medically unvalidated.

## 5. Completion Criteria

The project is complete when:

1. All required MySQL tables and constraints work.
2. SQL concepts can be demonstrated in MySQL Workbench.
3. The Next.js application supports the complete transplant workflow.
4. MongoDB Atlas receives approved synchronized records.
5. Database integrity and transaction tests pass.
6. The application can be demonstrated from a clean setup.
