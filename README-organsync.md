# OrganSync V2 — Organ Donation and Transplant Management System

A full-stack, database-driven organ donation and transplant management system developed as a **DBMS Level-3 Mini Project**.

OrganSync V2 provides a centralized platform for managing organ donors, patients, organ availability, waiting lists, compatibility assessments, organ allocations, transplant records, and follow-up information.

The project demonstrates relational database design, SQL constraints, triggers, stored procedures, transaction management, and synchronization between MySQL and MongoDB Atlas.

> **Disclaimer:** OrganSync V2 is an educational demonstration. Its compatibility and allocation logic is simplified and is not clinically validated for real-world medical decisions.

## Team Members

| Name | SRN |
|---|---|
| S Vinyas Gangadkar | PES2UG24CS418 |
| Sagar K | PES2UG24CS424 |

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Architecture](#3-database-architecture)
4. [Setup Instructions](#4-setup-instructions)
5. [Transplant Workflow](#5-transplant-workflow)
6. [Faculty Demo](#6-faculty-demo)

---

## 1. Project Overview

OrganSync V2 aims to improve the organization, consistency, and traceability of organ donation and transplantation records.

### Key Features

- Donor and patient registration and management
- Organ inventory and availability tracking
- Hospital and transplant centre management
- Patient waiting-list management
- Organ compatibility assessment and matching
- Organ allocation and release
- Transplant recording and follow-up tracking
- SQL constraints, triggers, stored procedures, and transactions
- MongoDB Atlas business collection synchronization
- Audit history and synchronization monitoring
- Interactive database demonstrations

The system provides a web interface for managing the transplant workflow while maintaining relational integrity in MySQL.

---

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React |
| Backend | Next.js API Routes, Node.js |
| Primary Database | MySQL 8 |
| Secondary Database | MongoDB Atlas |
| Database Connectivity | MySQL2, MongoDB Node.js Driver |
| Styling | CSS |
| Version Control | Git and GitHub |

---

## 3. Database Architecture

OrganSync V2 uses a hybrid relational and document-oriented database architecture.

### MySQL — Primary Transactional Database

**Database:** `organsync_v2`

MySQL is the authoritative source of business data and is responsible for:

- Maintaining donor, patient, organ, and transplant records
- Enforcing primary-key and foreign-key relationships
- Maintaining data integrity through constraints
- Executing stored procedures and triggers
- Supporting ACID-compliant transactions
- Preventing invalid organ allocations and transplant operations

The verified implementation contains:

| Database Component | Count |
|---|---:|
| Tables | 19 |
| Triggers | 20 |
| Stored Procedures | 3 |

### MongoDB Atlas — Secondary Document Database

**Database:** `organsync_v2_logs`

MongoDB Atlas stores privacy-conscious synchronized business documents and audit information.

Business collections include:

- `donors`
- `patients`
- `organs`
- `waiting_list`
- `medical_records`
- `matches`
- `compatibility_tests`
- `organ_allocations`
- `transplants`
- `transplant_follow_ups`
- `transplant_centres`
- `organ_types`

Additional collections include:

- `sync_events` — synchronized transactional outbox events
- `audit_history` — sanitized audit records
- `projection_sync_state` — synchronization checkpoints and state

MongoDB stores approved business attributes rather than complete copies of sensitive medical and personal information.

### Synchronization Architecture

The application uses the **Transactional Outbox Pattern** to synchronize committed MySQL changes with MongoDB Atlas.

**Data flow:**

MySQL Business Transaction → MySQL Sync Outbox → Synchronization Worker → MongoDB Atlas Business Collections and Audit History

The synchronization mechanism supports:

- Automatic propagation of supported application changes
- Idempotent document updates
- Retry handling and crash recovery
- Concurrency protection
- Stale-write prevention
- Deletion tombstones
- Initial data backfill and reconciliation

MySQL remains the primary database. MongoDB is an eventually consistent secondary read model.

Changes made directly through MySQL Workbench or other external SQL clients may require a reconciliation run because they can bypass application-generated outbox events.

---

## 4. Setup Instructions

### Prerequisites

Install the following software:

- Node.js and npm
- MySQL 8
- Git
- A MongoDB Atlas account with an accessible cluster

### Step 1 — Clone the Repository

```bash
git clone <repository-url>
cd organsync-v2
```

Replace `<repository-url>` with the actual GitHub repository URL.

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Environment Variables

Create a `.env.local` file in the project root using `.env.example` as the reference.

Configure the required MySQL and MongoDB settings.

Example variable names:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=organsync_v2

MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DATABASE=organsync_v2_logs
```

Additional synchronization worker and development-only authorization settings are documented in `.env.example`.

Never commit `.env.local`, database passwords, access tokens, or private connection strings to GitHub.

### Step 4 — Configure MySQL

Create the `organsync_v2` database if it does not already exist.

Apply the SQL migration files from the repository in their documented order.

For an existing installation, do not reapply migrations blindly or reset the database. Check the migration history and project documentation first.

### Step 5 — Configure MongoDB Atlas

1. Create or select a MongoDB Atlas cluster.
2. Configure a database user with appropriate permissions.
3. Allow the required client IP address through Atlas Network Access.
4. Configure the Atlas connection string in `.env.local`.
5. Ensure the application can access the `organsync_v2_logs` database.

Business collections are populated through the approved synchronization and backfill processes. They do not need to be manually populated in Atlas.

### Step 6 — Start the Application

```bash
npm run dev
```

Open:

http://localhost:3000

### Step 7 — Start the MongoDB Synchronization Worker

The synchronization worker runs separately from the Next.js development server.

After configuring the required environment opt-in, run:

```bash
npm run sync:worker
```

To execute one bounded synchronization batch:

```bash
npm run sync:worker -- --once
```

The worker requires explicit authorization through its environment configuration. Refer to `.env.example` and the implementation report for the supported settings.

Open the synchronization dashboard at:

http://localhost:3000/database-sync

### Step 8 — Run Tests

Run the unit tests:

```bash
npm test
```

Run the integration tests:

```bash
npm run test:integration
```

Verify the production build:

```bash
npm run build
```

Integration tests may require configured database connections and may create fictional test records. Review the test documentation before running them against an existing database.

**Security note:** Development-only write permissions and demo tokens are intended for local academic demonstrations. They must not be treated as production authentication or authorization.

---

## 5. Transplant Workflow

OrganSync V2 supports a structured organ donation and transplant workflow.

### Step 1 — Donor Registration

Register a donor and maintain the donor's information in the primary MySQL database.

### Step 2 — Organ Inventory

Record an organ associated with a donor, including its organ type and availability status.

### Step 3 — Patient Registration

Register a patient who may require an organ transplant.

### Step 4 — Waiting List

Add the patient to the waiting list for the required organ type.

### Step 5 — Compatibility Matching

Assess potential donor-organ and patient compatibility using the application's demonstration matching workflow and compatibility evidence.

### Step 6 — Organ Allocation

Allocate a compatible organ through the controlled allocation workflow. Database rules help prevent invalid or conflicting allocation operations.

### Step 7 — Transplant Recording

Record the completed transplant and update the related organ, allocation, and waiting-list states.

### Step 8 — Follow-up

Maintain follow-up information associated with the transplant record.

### Database Integrity During the Workflow

MySQL constraints, triggers, and stored procedures enforce the implemented database rules.

Transaction demonstrations show how successful operations are committed and invalid operations are rejected or rolled back.

Relevant business changes are synchronized to MongoDB Atlas through the outbox worker, subject to eventual consistency.

---

## 6. Faculty Demo

A structured faculty demonstration guide is available here:

**[Faculty Demo Guide](FACULTY-DEMO-GUIDE.md)**

The guide covers:

- Application overview and navigation
- Donor-to-transplant workflow
- MySQL relational database architecture
- Primary keys, foreign keys, and normalization
- SQL joins, CTEs, and queries
- Triggers, stored procedures, and constraints
- Transaction execution and rollback verification
- MongoDB Atlas collections and synchronization
- Audit history and database monitoring

### Important Application Pages

| Page | Purpose |
|---|---|
| `/` | Application homepage |
| `/database-demo` | MySQL demonstrations and rollback verification |
| `/database-sync` | MongoDB Atlas synchronization monitoring |
| `/transplants` | Transplant workflow and follow-up records |

For detailed verification evidence, see:

- [Phase 3F Report](PHASE3F-REPORT.md)
- [Phase 3G Report](PHASE3G-REPORT.md)
- [MongoDB Business Collections Extension Report](PHASE3F-EXTENSION-REPORT.md)

---

## Project Status

OrganSync V2 has completed its planned academic development phases and the additional MongoDB business collection synchronization extension.

The completed verification reported:

- 47 unit tests passed
- 65 integration tests passed
- Browser verification passed
- JavaScript syntax checks passed
- Production build passed
- 12 MongoDB business collections implemented
- Original 19 MySQL tables, 20 triggers, and 3 stored procedures preserved

The project remains an educational prototype and is not intended for deployment in real clinical environments.

---

## Conclusion

OrganSync V2 demonstrates how relational and document-oriented databases can work together in a full-stack application.

**MySQL** provides transactional consistency, relational integrity, and controlled transplant workflows, while **MongoDB Atlas** provides synchronized document-oriented views, event history, and audit tracking.

The project showcases practical DBMS concepts through a working web application, real SQL demonstrations, and verified database synchronization.