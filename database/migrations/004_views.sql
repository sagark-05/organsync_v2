USE organsync_v2;

-- ==========================================
-- 1. Available Organs View
-- ==========================================

CREATE OR REPLACE VIEW vw_available_organs AS
SELECT
    o.organ_id,
    ot.organ_name,
    d.donor_id,
    d.full_name AS donor_name,
    d.blood_group,
    tc.centre_name,
    o.organ_status,
    o.created_at
FROM organ o
JOIN donor d
    ON o.donor_id = d.donor_id
JOIN organ_type ot
    ON o.organ_type_id = ot.organ_type_id
JOIN transplant_centre tc
    ON o.centre_id = tc.centre_id
WHERE o.organ_status = 'AVAILABLE';


-- ==========================================
-- 2. Active Waiting List View
-- ==========================================

CREATE OR REPLACE VIEW vw_active_waiting_list AS
SELECT
    w.waiting_id,
    p.patient_id,
    p.full_name AS patient_name,
    p.blood_group,
    ot.organ_name,
    w.priority_level,
    tc.centre_name,
    w.status,
    w.registered_at
FROM waiting_list w
JOIN patient p
    ON w.patient_id = p.patient_id
JOIN organ_type ot
    ON w.organ_type_id = ot.organ_type_id
JOIN transplant_centre tc
    ON w.centre_id = tc.centre_id
WHERE w.status = 'ACTIVE';


-- ==========================================
-- 3. Candidate Matches View
-- ==========================================

CREATE OR REPLACE VIEW vw_candidate_matches AS
SELECT
    m.match_id,
    p.full_name AS patient_name,
    d.full_name AS donor_name,
    ot.organ_name,
    o.organ_id,
    m.match_status,
    m.created_at
FROM organ_match m
JOIN waiting_list w
    ON m.waiting_id = w.waiting_id
JOIN patient p
    ON w.patient_id = p.patient_id
JOIN organ o
    ON m.organ_id = o.organ_id
JOIN donor d
    ON o.donor_id = d.donor_id
JOIN organ_type ot
    ON o.organ_type_id = ot.organ_type_id;


-- ==========================================
-- 4. Compatibility Results View
-- Latest test per match
-- ==========================================

CREATE OR REPLACE VIEW vw_latest_compatibility AS
SELECT
    m.match_id,
    m.match_status,
    ct.test_id,
    ct.blood_group_result,
    ct.hla_result,
    ct.overall_result,
    ct.test_date
FROM organ_match m
LEFT JOIN compatibility_test ct
    ON ct.test_id = (
        SELECT ct2.test_id
        FROM compatibility_test ct2
        WHERE ct2.match_id = m.match_id
        ORDER BY ct2.test_date DESC,
                    ct2.test_id DESC
        LIMIT 1
    );


-- ==========================================
-- 5. Transplant Summary View
-- ==========================================

CREATE OR REPLACE VIEW vw_transplant_summary AS
SELECT
    t.transplant_id,
    p.patient_id,
    p.full_name AS patient_name,
    d.full_name AS donor_name,
    ot.organ_name,
    tc.centre_name,
    t.performed_at,
    t.outcome
FROM transplant t
JOIN organ_allocation a
    ON t.allocation_id = a.allocation_id
JOIN organ_match m
    ON a.match_id = m.match_id
JOIN waiting_list w
    ON m.waiting_id = w.waiting_id
JOIN patient p
    ON w.patient_id = p.patient_id
JOIN organ o
    ON m.organ_id = o.organ_id
JOIN donor d
    ON o.donor_id = d.donor_id
JOIN organ_type ot
    ON o.organ_type_id = ot.organ_type_id
JOIN transplant_centre tc
    ON t.centre_id = tc.centre_id;


-- ==========================================
-- 6. Dashboard Statistics View
-- ==========================================

CREATE OR REPLACE VIEW vw_dashboard_statistics AS
SELECT
    (SELECT COUNT(*) FROM donor)
        AS total_donors,

    (SELECT COUNT(*) FROM patient)
        AS total_patients,

    (SELECT COUNT(*)
     FROM organ
     WHERE organ_status = 'AVAILABLE')
        AS available_organs,

    (SELECT COUNT(*)
     FROM waiting_list
     WHERE status = 'ACTIVE')
        AS active_waiting_entries,

    (SELECT COUNT(*)
     FROM organ_match
     WHERE match_status = 'APPROVED')
        AS approved_matches,

    (SELECT COUNT(*)
     FROM transplant)
        AS total_transplants,

    (SELECT COUNT(*)
     FROM transplant_centre
     WHERE is_active = TRUE)
        AS active_centres;


-- ==========================================
-- 7. Organ Availability by Type
-- ==========================================

CREATE OR REPLACE VIEW vw_organ_availability AS
SELECT
    ot.organ_type_id,
    ot.organ_name,
    COUNT(o.organ_id) AS available_count
FROM organ_type ot
LEFT JOIN organ o
    ON ot.organ_type_id = o.organ_type_id
    AND o.organ_status = 'AVAILABLE'
GROUP BY
    ot.organ_type_id,
    ot.organ_name;


-- ==========================================
-- 8. Verify Created Views
-- ==========================================

SELECT
    TABLE_NAME AS view_name
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'organsync_v2'
ORDER BY TABLE_NAME;


-- ==========================================
-- 9. Test Views
-- ==========================================

SELECT * FROM vw_available_organs;

SELECT * FROM vw_active_waiting_list;

SELECT * FROM vw_candidate_matches;

SELECT * FROM vw_latest_compatibility;

SELECT * FROM vw_transplant_summary;

SELECT * FROM vw_dashboard_statistics;

SELECT * FROM vw_organ_availability;