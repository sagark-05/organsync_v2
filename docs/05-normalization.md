# OrganSync V2 — Database Normalization

## 1. Overview

OrganSync V2 follows **Third Normal Form (3NF)** to reduce data redundancy, prevent update anomalies, and maintain consistency across its relational tables.

## 2. Normalization Stages

| Normal Form | Rule | Implementation in OrganSync |
|---|---|---|
| 1NF | Atomic values and no repeating groups | Donor, patient, organ, and medical records use individual fields and rows |
| 2NF | No partial dependency on a composite candidate key | Entity attributes depend on their complete candidate keys |
| 3NF | No transitive dependency of non-key attributes on candidate keys | Centre, organ type, and patient details are stored in separate tables |

## 3. Example: Organ Registration

### Before Normalization

| Organ_ID | Donor_Name | Donor_Blood_Group | Organ_Type | Centre_Name |
|---|---|---|---|---|
| 101 | Rahul | O+ | Kidney | Centre A |
| 102 | Rahul | O+ | Liver | Centre A |

**Problem:** Donor and centre information is repeated for every organ.

### After Normalization

**Donor**

| donor_id | full_name | blood_group |
|---|---|---|
| 1 | Rahul | O+ |

**Organ**

| organ_id | donor_id | organ_type_id | centre_id |
|---|---|---|---|
| 101 | 1 | 1 | 1 |
| 102 | 1 | 2 | 1 |

Organ types and transplant centre details are maintained in separate tables.

## 4. Functional Dependencies

| Table | Functional Dependency |
|---|---|
| `donor` | donor_id → full_name, date_of_birth, blood_group, donor_type |
| `patient` | patient_id → full_name, date_of_birth, sex, blood_group |
| `organ` | organ_id → donor_id, organ_type_id, centre_id, organ_status |
| `waiting_list` | waiting_id → patient_id, organ_type_id, priority_level, status |
| `organ_match` | match_id → waiting_id, organ_id, match_status |
| `organ_allocation` | allocation_id → match_id, allocation_status |
| `transplant` | transplant_id → allocation_id, centre_id, performed_at, outcome |

## 5. Avoiding Redundancy

OrganSync separates related entities using foreign keys.

- Donor details are stored in `donor`, not repeated in `organ`.
- Organ names are stored in `organ_type`.
- Transplant centre information is stored in `transplant_centre`.
- Patient details are not duplicated in `waiting_list`.
- `organ_allocation` references `match_id` without duplicating `organ_id`.
- Blood group information is retrieved from the donor rather than duplicated in the organ record.

## 6. Benefits

- Reduced duplicate data.
- Fewer insertion, update, and deletion anomalies.
- Better referential integrity.
- Easier maintenance and reporting.
- Consistent data across related tables.

**Result:** The OrganSync V2 relational design targets 3NF, with final normalization verified against the implemented MySQL schema and its functional dependencies.
