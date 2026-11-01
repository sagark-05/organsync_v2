USE organsync_v2;

-- Total Donors
SELECT COUNT(*) AS total_donors
FROM donor;

-- Total Patients
SELECT COUNT(*) AS total_patients
FROM patient;

-- Available Organs by Type
SELECT
    ot.organ_name,
    COUNT(o.organ_id) AS available_count
FROM organ_type ot
LEFT JOIN organ o
    ON ot.organ_type_id = o.organ_type_id
    AND o.organ_status = 'AVAILABLE'
GROUP BY ot.organ_type_id, ot.organ_name;

-- Active Waiting-List Entries by Priority
SELECT
    priority_level,
    COUNT(*) AS total_patients
FROM waiting_list
WHERE status = 'ACTIVE'
GROUP BY priority_level
ORDER BY priority_level DESC;

-- Transplants by Centre
SELECT
    tc.centre_name,
    COUNT(t.transplant_id) AS total_transplants
FROM transplant_centre tc
LEFT JOIN transplant t
    ON tc.centre_id = t.centre_id
GROUP BY tc.centre_id, tc.centre_name;

-- Organ Types With Multiple Active Requests
SELECT
    organ_type_id,
    COUNT(*) AS total_requests
FROM waiting_list
WHERE status = 'ACTIVE'
GROUP BY organ_type_id
HAVING COUNT(*) > 1;