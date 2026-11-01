USE organsync_v2;

-- ==========================================
-- 1. Waiting-list priority (1 to 5)
-- ==========================================

ALTER TABLE waiting_list
ADD CONSTRAINT chk_waiting_priority
CHECK (priority_level BETWEEN 1 AND 5);


-- ==========================================
-- 2. Prevent duplicate ACTIVE / MATCHED
-- waiting-list registrations
-- ==========================================

ALTER TABLE waiting_list
ADD COLUMN active_patient_id BIGINT UNSIGNED
GENERATED ALWAYS AS (
    CASE
        WHEN status IN ('ACTIVE', 'MATCHED')
        THEN patient_id
        ELSE NULL
    END
) STORED;

ALTER TABLE waiting_list
ADD COLUMN active_organ_type_id SMALLINT UNSIGNED
GENERATED ALWAYS AS (
    CASE
        WHEN status IN ('ACTIVE', 'MATCHED')
        THEN organ_type_id
        ELSE NULL
    END
) STORED;

CREATE UNIQUE INDEX uq_active_waiting_registration
ON waiting_list (
    active_patient_id,
    active_organ_type_id
);


-- ==========================================
-- 3. Prevent invalid allocation timestamps
-- ==========================================

ALTER TABLE organ_allocation
ADD CONSTRAINT chk_allocation_release_time
CHECK (
    released_at IS NULL
    OR released_at >= allocated_at
);


-- ==========================================
-- 4. Prevent negative sync retry counts
-- ==========================================

ALTER TABLE sync_outbox
ADD CONSTRAINT chk_sync_attempt_count
CHECK (attempt_count >= 0);


-- ==========================================
-- 5. Verify constraints
-- ==========================================

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'organsync_v2'
ORDER BY TABLE_NAME, CONSTRAINT_NAME;