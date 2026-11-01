USE organsync_v2;

-- ==========================================
-- 1. Donor and Patient Indexes
-- ==========================================

CREATE INDEX idx_donor_centre
ON donor (centre_id);

CREATE INDEX idx_patient_centre
ON patient (centre_id);


-- ==========================================
-- 2. Organ Inventory Indexes
-- ==========================================

CREATE INDEX idx_organ_status_type
ON organ (organ_status, organ_type_id);

CREATE INDEX idx_organ_donor
ON organ (donor_id);

CREATE INDEX idx_organ_centre
ON organ (centre_id);


-- ==========================================
-- 3. Waiting List Indexes
-- ==========================================

CREATE INDEX idx_waiting_status_type
ON waiting_list (status, organ_type_id);

CREATE INDEX idx_waiting_priority
ON waiting_list (
    status,
    priority_level,
    registered_at
);


-- ==========================================
-- 4. Matching and Compatibility Indexes
-- ==========================================

CREATE INDEX idx_match_status
ON organ_match (match_status);

CREATE INDEX idx_match_organ_status
ON organ_match (organ_id, match_status);

CREATE INDEX idx_compatibility_match_date
ON compatibility_test (match_id, test_date);


-- ==========================================
-- 5. Allocation and Transplant Indexes
-- ==========================================

CREATE INDEX idx_allocation_status
ON organ_allocation (allocation_status);

CREATE INDEX idx_transplant_date
ON transplant (performed_at);

CREATE INDEX idx_followup_date
ON transplant_follow_up (follow_up_date);


-- ==========================================
-- 6. Audit Log Indexes
-- ==========================================

CREATE INDEX idx_audit_entity
ON audit_log (entity_name, entity_id);

CREATE INDEX idx_audit_occurred
ON audit_log (occurred_at);


-- ==========================================
-- 7. Session Indexes
-- ==========================================

CREATE INDEX idx_session_expiry
ON app_session (expires_at);


-- ==========================================
-- 8. MongoDB Synchronization Indexes
-- ==========================================

CREATE INDEX idx_outbox_status_created
ON sync_outbox (status, created_at);

CREATE INDEX idx_outbox_aggregate
ON sync_outbox (
    aggregate_type,
    aggregate_id,
    event_id
);


-- ==========================================
-- 9. Verify Created Indexes
-- ==========================================

SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'organsync_v2'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;


-- ==========================================
-- 10. Query Optimization Example
-- ==========================================

EXPLAIN
SELECT
    organ_id,
    organ_type_id,
    organ_status
FROM organ
WHERE organ_status = 'AVAILABLE'
    AND organ_type_id = 1;