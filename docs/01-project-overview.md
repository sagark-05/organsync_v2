# OrganSync V2 — Project Overview

**Project:** OrganSync — Organ Donation and Transplant Management System  
**Project Type:** DBMS Mini Project (SQL + NoSQL)

## 1. Introduction

OrganSync V2 is a database-driven application designed to manage organ donors, patients, organ inventory, waiting lists, compatibility assessments, transplant records, and follow-up information.

The system uses MySQL as its primary relational database and MongoDB Atlas as a secondary NoSQL database for synchronized records and audit information.

A Next.js application provides the user interface and backend integration.

## 2. Problem Statement

Organ donation and transplantation involve multiple interconnected records, including donor information, patient registrations, organ availability, compatibility assessments, and transplant history.

Managing these records without a structured database can introduce duplication, inconsistent information, and difficulty tracking activities.

OrganSync aims to provide a centralized educational registry that maintains data integrity, supports a traceable workflow, and enables efficient retrieval and reporting.

## 3. Project Objectives

1. Design a normalized relational database up to Third Normal Form (3NF).
2. Implement primary keys, foreign keys, and integrity constraints.
3. Demonstrate SQL CRUD operations, JOINs, subqueries, CTEs, views, triggers, stored procedures, indexes, and transactions.
4. Manage donor, patient, organ, waiting-list, matching, and transplant information.
5. Develop a web interface connected to MySQL.
6. Integrate MongoDB Atlas for secondary document storage and audit records.
7. Implement reliable synchronization between MySQL and MongoDB.
8. Test database integrity, query correctness, and application workflows.

## 4. Proposed Technology Stack

| Component | Technology |
|---|---|
| Primary Database | MySQL 8.x |
| Secondary Database | MongoDB Atlas |
| Frontend | Next.js / React |
| Backend | Next.js Route Handlers |
| Database Connectivity | mysql2 and MongoDB Node.js Driver |
| Version Control | Git and GitHub |
| Database Management | MySQL Workbench and MongoDB Atlas |

## 5. Project Scope

### Included

- User authentication and role-based authorization
- Donor and patient registration
- Organ inventory management
- Hospital and waiting-list management
- Simplified compatibility assessment workflows
- Transplant records and follow-up tracking
- SQL-based reports and statistics
- MongoDB synchronization and audit logging

### Excluded

- Real-world clinical compatibility decisions
- Automated medical treatment recommendations
- Integration with government transplant registries
- Real patient data and production healthcare deployment

## 6. Expected Outcomes

- A normalized MySQL database with documented relationships and constraints.
- Executable SQL scripts organized by database concepts.
- A working Next.js application connected to MySQL.
- MongoDB Atlas integration for approved synchronized records.
- Database tests, documentation, and a reproducible demonstration workflow.

## 7. Development Approach

OrganSync V2 follows a database-first development approach:

1. Requirements analysis and documentation
2. ER modeling and normalization
3. MySQL schema and SQL implementation
4. Backend integration
5. Frontend development
6. MongoDB synchronization
7. Testing, verification, and demonstration

## 8. Educational Disclaimer

OrganSync V2 is an educational prototype. All patient and donor records used for demonstrations must be fictional. Compatibility assessments and prioritization rules are simplified and medically unvalidated. The system must not be used to make real-world transplantation decisions.

---


