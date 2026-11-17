
USE organsync_v2;

-- ==========================================
-- 1. Transplant Centres
-- ==========================================

INSERT INTO transplant_centre
(centre_name, city, state, contact_email,
 contact_phone, is_active, created_at)
VALUES
('Demo Medical Centre A', 'Bengaluru', 'Karnataka',
 'centre-a@example.com', '9000000001', TRUE, NOW()),
('Demo Medical Centre B', 'Mysuru', 'Karnataka',
 'centre-b@example.com', '9000000002', TRUE, NOW());

-- ==========================================
-- 2. Organ Types
-- ==========================================

INSERT INTO organ_type (organ_name, is_active)
VALUES
('Kidney', TRUE),
('Liver', TRUE),
('Heart', TRUE),
('Lung', TRUE),
('Pancreas', TRUE);

-- ==========================================
-- 3. Donors
-- ==========================================

INSERT INTO donor
(centre_id, full_name, date_of_birth,
 blood_group, donor_type, contact_phone,
 registered_at)
VALUES
(1, 'Demo Donor A', '1990-04-12',
 'O+', 'LIVING', '9000000011', NOW()),
(1, 'Demo Donor B', '1985-08-20',
 'A+', 'DECEASED', '9000000012', NOW()),
(2, 'Demo Donor C', '1992-01-15',
 'B+', 'LIVING', '9000000013', NOW()),
(2, 'Demo Donor D', '1988-11-05',
 'O-', 'DECEASED', '9000000014', NOW());

-- ==========================================
-- 4. Patients
-- ==========================================

INSERT INTO patient
(centre_id, full_name, date_of_birth,
 sex, blood_group, contact_phone,
 city, registered_at)
VALUES
(1, 'Demo Patient A', '1998-03-10',
 'MALE', 'O+', '9000000021',
 'Bengaluru', NOW()),
(1, 'Demo Patient B', '1995-06-18',
 'FEMALE', 'A+', '9000000022',
 'Bengaluru', NOW()),
(2, 'Demo Patient C', '2000-09-25',
 'MALE', 'B+', '9000000023',
 'Mysuru', NOW()),
(2, 'Demo Patient D', '1993-12-08',
 'FEMALE', 'O-', '9000000024',
 'Mysuru', NOW());

-- ==========================================
-- 5. Organs
-- ==========================================

INSERT INTO organ
(donor_id, organ_type_id, centre_id,
 organ_status, retrieved_at, created_at)
VALUES
(1, 1, 1, 'AVAILABLE', NULL, NOW()),
(2, 2, 1, 'AVAILABLE', NOW(), NOW()),
(3, 1, 2, 'AVAILABLE', NULL, NOW()),
(4, 3, 2, 'AVAILABLE', NOW(), NOW()),
(4, 4, 2, 'AVAILABLE', NOW(), NOW());

-- ==========================================
-- 6. Waiting List
-- ==========================================

INSERT INTO waiting_list
(patient_id, organ_type_id, centre_id,
 priority_level, status, registered_at)
VALUES
(1, 1, 1, 5, 'ACTIVE', NOW()),
(2, 2, 1, 4, 'ACTIVE', NOW()),
(3, 1, 2, 3, 'ACTIVE', NOW()),
(4, 3, 2, 5, 'ACTIVE', NOW());

-- ==========================================
-- 7. Medical Records
-- ==========================================
-- Requires a valid app_user because
-- medical_record.recorded_by is a foreign key.
-- Insert after implementing user seeding.

-- ==========================================
-- 8. Candidate Matches
-- ==========================================

INSERT INTO organ_match
(waiting_id, organ_id, match_status, created_at)
VALUES
(1, 1, 'PROPOSED', NOW()),
(2, 2, 'PROPOSED', NOW()),
(3, 3, 'PROPOSED', NOW()),
(4, 4, 'PROPOSED', NOW());

-- ==========================================
-- 9. Demonstrate Match Status Transitions
-- ==========================================

UPDATE organ_match
SET match_status = 'TESTING'
WHERE match_id IN (1, 2);

-- Compatibility tests require a valid
-- app_user.performed_by value.
-- Add them after creating a demo user.

-- ==========================================
-- 10. Verify Seeded Data
-- ==========================================

SELECT * FROM transplant_centre;
SELECT * FROM organ_type;
SELECT * FROM donor;
SELECT * FROM patient;
SELECT * FROM organ;
SELECT * FROM waiting_list;
SELECT * FROM organ_match;

-- ==========================================
-- 11. Dashboard Verification
-- ==========================================

SELECT * FROM vw_dashboard_statistics;

SELECT * FROM vw_available_organs;

SELECT * FROM vw_active_waiting_list;

SELECT * FROM vw_candidate_matches;

