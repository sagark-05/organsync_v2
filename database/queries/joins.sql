USE organsync_v2;

-- INNER JOIN: Organ and Donor Details
SELECT
    o.organ_id,
    d.full_name AS donor_name,
    ot.organ_name,
    o.organ_status
FROM organ o
INNER JOIN donor d ON o.donor_id = d.donor_id
INNER JOIN organ_type ot ON o.organ_type_id = ot.organ_type_id;

-- LEFT JOIN: All Patients and Their Waiting Lists
SELECT
    p.patient_id,
    p.full_name,
    w.waiting_id,
    w.status
FROM patient p
LEFT JOIN waiting_list w ON p.patient_id = w.patient_id;

-- Multi-table JOIN: Matching Details
SELECT
    m.match_id,
    p.full_name AS patient_name,
    ot.organ_name,
    m.match_status
FROM organ_match m
JOIN waiting_list w ON m.waiting_id = w.waiting_id
JOIN patient p ON w.patient_id = p.patient_id
JOIN organ o ON m.organ_id = o.organ_id
JOIN organ_type ot ON o.organ_type_id = ot.organ_type_id;