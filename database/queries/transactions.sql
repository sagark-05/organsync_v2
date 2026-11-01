USE organsync_v2;

-- ==========================================
-- Transaction Demonstrations
-- Use fictional test records only.
-- ==========================================

-- 1. COMMIT Example
-- Replace 1 with an existing test centre ID.

START TRANSACTION;

INSERT INTO donor (
    centre_id,
    full_name,
    date_of_birth,
    blood_group,
    donor_type,
    registered_at
)
VALUES (
    1,
    'Demo Donor',
    '1995-06-15',
    'O+',
    'LIVING',
    NOW()
);

COMMIT;


-- 2. ROLLBACK Example
-- This record should not persist.

START TRANSACTION;

INSERT INTO patient (
    centre_id,
    full_name,
    date_of_birth,
    sex,
    blood_group,
    registered_at
)
VALUES (
    1,
    'Rollback Test Patient',
    '1998-03-20',
    'MALE',
    'A+',
    NOW()
);

ROLLBACK;


-- 3. Row-Level Locking Example
-- Execute within a transaction.

START TRANSACTION;

SELECT
    organ_id,
    organ_status
FROM organ
WHERE organ_id = 1
FOR UPDATE;

-- No changes are made in this example.

ROLLBACK;


-- 4. Stored Procedure Calls
-- Run only after inserting valid test data
-- and creating approved matches.

-- CALL sp_allocate_organ(1);

-- CALL sp_release_allocation(1);

-- CALL sp_record_transplant(
--     1,
--     1,
--     NOW(),
--     'SUCCESSFUL',
--     'Educational demo transplant'
-- );