-- PROPOSAL ONLY: requires explicit approval before application.
-- Does not alter migrations 001-006 or replace any existing routine.
-- Caller MUST start/commit/roll back its transaction; these routines never commit.
-- Before CALL, caller must create SAVEPOINT organsync_phase3e_call; the routine consumes it.
-- Missing hand-off savepoint causes an error before any business write.
-- Existing rows must pass the documented preflight queries before applying DDL.
USE organsync_v2;

-- Preflight: all queries must return no rows.
SELECT waiting_id, organ_id, COUNT(*) AS duplicates FROM organ_match GROUP BY waiting_id, organ_id HAVING COUNT(*) > 1;
SELECT organ_id, COUNT(*) AS approvals FROM organ_match WHERE match_status='APPROVED' GROUP BY organ_id HAVING COUNT(*) > 1;
SELECT waiting_id, COUNT(*) AS approvals FROM organ_match WHERE match_status='APPROVED' GROUP BY waiting_id HAVING COUNT(*) > 1;

CREATE UNIQUE INDEX uq_match_pair ON organ_match (waiting_id,organ_id);
CREATE UNIQUE INDEX uq_approved_organ ON organ_match ((CASE WHEN match_status='APPROVED' THEN organ_id ELSE NULL END));
CREATE UNIQUE INDEX uq_approved_waiting ON organ_match ((CASE WHEN match_status='APPROVED' THEN waiting_id ELSE NULL END));

DELIMITER $$

CREATE PROCEDURE sp_allocate_organ_tx(
    IN p_match_id BIGINT UNSIGNED,
    IN p_actor_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_organ_id BIGINT UNSIGNED;
    DECLARE v_waiting_id BIGINT UNSIGNED;
    DECLARE v_allocation_id BIGINT UNSIGNED;

    DECLARE v_match_status VARCHAR(20);
    DECLARE v_organ_status VARCHAR(20);
    DECLARE v_waiting_status VARCHAR(20);
    DECLARE v_compatibility VARCHAR(20);

    DECLARE v_count INT DEFAULT 0;


    RELEASE SAVEPOINT organsync_phase3e_call;
    IF NOT EXISTS (SELECT 1 FROM app_user WHERE user_id=p_actor_id AND role='CLINICIAN' AND is_active=TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Active clinician required';
    END IF;

    -- Read match information.
    SELECT
        organ_id,
        waiting_id,
        match_status
    INTO
        v_organ_id,
        v_waiting_id,
        v_match_status
    FROM organ_match
    WHERE match_id = p_match_id
    FOR UPDATE;

    IF v_organ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Match not found';
    END IF;

    IF v_match_status <> 'APPROVED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Match must be approved';
    END IF;

    -- Lock organ.
    SELECT organ_status
    INTO v_organ_status
    FROM organ
    WHERE organ_id = v_organ_id
    FOR UPDATE;

    -- Lock waiting-list entry.
    SELECT status
    INTO v_waiting_status
    FROM waiting_list
    WHERE waiting_id = v_waiting_id
    FOR UPDATE;

    IF v_organ_status <> 'AVAILABLE' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Organ is not available';
    END IF;

    IF v_waiting_status <> 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Waiting-list entry is not active';
    END IF;

    -- Verify latest compatibility assessment.
    SELECT (
        SELECT overall_result
        FROM compatibility_test
        WHERE match_id = p_match_id
        ORDER BY test_date DESC, test_id DESC
        LIMIT 1
    )
    INTO v_compatibility;

    IF v_compatibility IS NULL
       OR v_compatibility <> 'COMPATIBLE' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Compatible assessment required';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM compatibility_test ct JOIN app_user u ON u.user_id=ct.performed_by WHERE ct.test_id=(SELECT test_id FROM compatibility_test WHERE match_id=p_match_id ORDER BY test_date DESC,test_id DESC LIMIT 1) AND ct.overall_result='COMPATIBLE' AND ct.blood_group_result='COMPATIBLE' AND ct.hla_result='COMPATIBLE' AND u.role='CLINICIAN' AND u.is_active=TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatible clinician evidence required';
    END IF;
    -- Prevent duplicate active reservations.
    SELECT COUNT(*)
    INTO v_count
    FROM active_organ_reservation
    WHERE organ_id = v_organ_id;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Organ already reserved';
    END IF;

    INSERT INTO organ_allocation (
        match_id,
        allocation_status,
        allocated_at
    )
    VALUES (
        p_match_id,
        'RESERVED',
        UTC_TIMESTAMP()
    );

    SET v_allocation_id = LAST_INSERT_ID();

    INSERT INTO active_organ_reservation (
        organ_id,
        allocation_id
    )
    VALUES (
        v_organ_id,
        v_allocation_id
    );

    UPDATE organ
    SET organ_status = 'RESERVED'
    WHERE organ_id = v_organ_id;

    UPDATE waiting_list
    SET status = 'MATCHED'
    WHERE waiting_id = v_waiting_id;

    INSERT INTO audit_log (user_id,entity_name,entity_id,action) VALUES (p_actor_id,'organ_allocation',v_allocation_id,'CREATED');
    INSERT INTO sync_outbox (aggregate_type,aggregate_id,event_type,payload) VALUES ('organ_allocation',v_allocation_id,'ORGAN_ALLOCATION_CREATED',JSON_OBJECT('allocation_id',CAST(v_allocation_id AS CHAR),'action','CREATED'));


    SELECT
        CAST(v_allocation_id AS CHAR) AS allocation_id,
        'Organ allocated successfully' AS message;
END$$

CREATE PROCEDURE sp_release_allocation_tx(
    IN p_allocation_id BIGINT UNSIGNED,
    IN p_actor_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_organ_id BIGINT UNSIGNED;
    DECLARE v_waiting_id BIGINT UNSIGNED;
    DECLARE v_status VARCHAR(20);
    DECLARE v_reservation_id BIGINT UNSIGNED;


    RELEASE SAVEPOINT organsync_phase3e_call;
    IF NOT EXISTS (SELECT 1 FROM app_user WHERE user_id=p_actor_id AND role='CLINICIAN' AND is_active=TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Active clinician required';
    END IF;

    SELECT
        a.allocation_status,
        m.organ_id,
        m.waiting_id
    INTO
        v_status,
        v_organ_id,
        v_waiting_id
    FROM organ_allocation a
    JOIN organ_match m
        ON a.match_id = m.match_id
    WHERE a.allocation_id = p_allocation_id
    FOR UPDATE;

    IF v_organ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Allocation not found';
    END IF;

    IF v_status <> 'RESERVED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Allocation is not reserved';
    END IF;

    -- Lock associated organ and waiting-list rows.
    SELECT organ_id
    INTO v_reservation_id
    FROM organ
    WHERE organ_id = v_organ_id
    FOR UPDATE;

    SELECT waiting_id
    INTO v_reservation_id
    FROM waiting_list
    WHERE waiting_id = v_waiting_id
    FOR UPDATE;

    -- Remove active reservation.
    DELETE FROM active_organ_reservation
    WHERE organ_id = v_organ_id
      AND allocation_id = p_allocation_id;

    IF ROW_COUNT() <> 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Active reservation not found';
    END IF;

    UPDATE organ_allocation
    SET allocation_status = 'RELEASED',
        released_at = UTC_TIMESTAMP()
    WHERE allocation_id = p_allocation_id;

    UPDATE organ
    SET organ_status = 'AVAILABLE'
    WHERE organ_id = v_organ_id;

    UPDATE waiting_list
    SET status = 'ACTIVE'
    WHERE waiting_id = v_waiting_id
      AND status = 'MATCHED';

    INSERT INTO audit_log (user_id,entity_name,entity_id,action) VALUES (p_actor_id,'organ_allocation',p_allocation_id,'RELEASED');
    INSERT INTO sync_outbox (aggregate_type,aggregate_id,event_type,payload) VALUES ('organ_allocation',p_allocation_id,'ORGAN_ALLOCATION_RELEASED',JSON_OBJECT('allocation_id',CAST(p_allocation_id AS CHAR),'action','RELEASED'));


    SELECT 'Allocation released successfully' AS message;
END$$

CREATE PROCEDURE sp_record_transplant_tx(
    IN p_allocation_id BIGINT UNSIGNED,
    IN p_centre_id BIGINT UNSIGNED,
    IN p_performed_at DATETIME,
    IN p_outcome VARCHAR(30),
    IN p_notes TEXT,
    IN p_actor_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_organ_id BIGINT UNSIGNED;
    DECLARE v_waiting_id BIGINT UNSIGNED;
    DECLARE v_allocation_status VARCHAR(20);
    DECLARE v_organ_status VARCHAR(20);
    DECLARE v_waiting_status VARCHAR(20);
    DECLARE v_transplant_id BIGINT UNSIGNED;
    DECLARE v_locked_id BIGINT UNSIGNED;
    DECLARE v_count INT DEFAULT 0;


    RELEASE SAVEPOINT organsync_phase3e_call;
    IF NOT EXISTS (SELECT 1 FROM app_user WHERE user_id=p_actor_id AND role='CLINICIAN' AND is_active=TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Active clinician required';
    END IF;

    SELECT
        a.allocation_status,
        m.organ_id,
        m.waiting_id
    INTO
        v_allocation_status,
        v_organ_id,
        v_waiting_id
    FROM organ_allocation a
    JOIN organ_match m
        ON a.match_id = m.match_id
    WHERE a.allocation_id = p_allocation_id
    FOR UPDATE;

    IF v_organ_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Allocation not found';
    END IF;

    IF v_allocation_status <> 'RESERVED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Allocation must be reserved';
    END IF;

    SELECT organ_status
    INTO v_organ_status
    FROM organ
    WHERE organ_id = v_organ_id
    FOR UPDATE;

    SELECT status
    INTO v_waiting_status
    FROM waiting_list
    WHERE waiting_id = v_waiting_id
    FOR UPDATE;

    IF v_organ_status <> 'RESERVED'
       OR v_waiting_status <> 'MATCHED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid organ or waiting-list state';
    END IF;

    IF p_performed_at IS NULL OR p_performed_at > UTC_TIMESTAMP() OR p_performed_at < (SELECT allocated_at FROM organ_allocation WHERE allocation_id=p_allocation_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid transplant timestamp';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM compatibility_test ct JOIN app_user u ON u.user_id=ct.performed_by WHERE ct.test_id=(SELECT ct2.test_id FROM compatibility_test ct2 JOIN organ_match m ON m.match_id=ct2.match_id JOIN organ_allocation a ON a.match_id=m.match_id WHERE a.allocation_id=p_allocation_id ORDER BY ct2.test_date DESC,ct2.test_id DESC LIMIT 1) AND ct.overall_result='COMPATIBLE' AND ct.blood_group_result='COMPATIBLE' AND ct.hla_result='COMPATIBLE' AND u.role='CLINICIAN' AND u.is_active=TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatible clinician evidence required';
    END IF;
    -- Verify active reservation.
    SELECT COUNT(*)
    INTO v_count
    FROM active_organ_reservation
    WHERE organ_id = v_organ_id
      AND allocation_id = p_allocation_id;

    IF v_count <> 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Valid active reservation required';
    END IF;

    -- Prevent duplicate transplantation.
    SELECT COUNT(*)
    INTO v_count
    FROM organ_transplant_record
    WHERE organ_id = v_organ_id;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Organ already transplanted';
    END IF;

    IF p_outcome NOT IN (
        'SUCCESSFUL',
        'COMPLICATIONS',
        'UNKNOWN'
    ) OR p_outcome IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid transplant outcome';
    END IF;

    INSERT INTO transplant (
        allocation_id,
        centre_id,
        performed_at,
        outcome,
        notes
    )
    VALUES (
        p_allocation_id,
        p_centre_id,
        p_performed_at,
        p_outcome,
        p_notes
    );

    SET v_transplant_id = LAST_INSERT_ID();

    INSERT INTO organ_transplant_record (
        organ_id,
        transplant_id
    )
    VALUES (
        v_organ_id,
        v_transplant_id
    );

    UPDATE organ_allocation
    SET allocation_status = 'COMPLETED'
    WHERE allocation_id = p_allocation_id;

    UPDATE organ
    SET organ_status = 'TRANSPLANTED'
    WHERE organ_id = v_organ_id;

    UPDATE waiting_list
    SET status = 'COMPLETED'
    WHERE waiting_id = v_waiting_id;

    DELETE FROM active_organ_reservation
    WHERE organ_id = v_organ_id
      AND allocation_id = p_allocation_id;

    INSERT INTO audit_log (user_id,entity_name,entity_id,action) VALUES (p_actor_id,'transplant',v_transplant_id,'COMPLETED');
    INSERT INTO sync_outbox (aggregate_type,aggregate_id,event_type,payload) VALUES ('transplant',v_transplant_id,'TRANSPLANT_COMPLETED',JSON_OBJECT('transplant_id',CAST(v_transplant_id AS CHAR),'action','COMPLETED'));


    SELECT
        CAST(v_transplant_id AS CHAR) AS transplant_id,
        'Transplant recorded successfully' AS message;
END$$

CREATE TRIGGER trg_match_transition_guard BEFORE UPDATE ON organ_match FOR EACH ROW
BEGIN
    IF NEW.waiting_id <> OLD.waiting_id OR NEW.organ_id <> OLD.organ_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Match pair identity is immutable';
    END IF;
    IF NEW.match_status <> OLD.match_status THEN
        IF NOT ((OLD.match_status='PROPOSED' AND NEW.match_status IN ('TESTING','REJECTED','CANCELLED')) OR (OLD.match_status='TESTING' AND NEW.match_status IN ('APPROVED','REJECTED','CANCELLED')) OR (OLD.match_status='APPROVED' AND NEW.match_status='CANCELLED')) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid match status transition';
        END IF;
        IF EXISTS (SELECT 1 FROM organ_allocation WHERE match_id=OLD.match_id AND allocation_status IN ('RESERVED','COMPLETED')) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Allocated match status is protected';
        END IF;
        IF NEW.match_status='APPROVED' AND NOT EXISTS (SELECT 1 FROM compatibility_test ct JOIN app_user u ON u.user_id=ct.performed_by WHERE ct.test_id=(SELECT test_id FROM compatibility_test WHERE match_id=OLD.match_id ORDER BY test_date DESC,test_id DESC LIMIT 1) AND ct.overall_result='COMPATIBLE' AND ct.blood_group_result='COMPATIBLE' AND ct.hla_result='COMPATIBLE' AND u.role='CLINICIAN' AND u.is_active=TRUE) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatible clinician evidence required';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_compatibility_insert_guard BEFORE INSERT ON compatibility_test FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM app_user WHERE user_id=NEW.performed_by AND role='CLINICIAN' AND is_active=TRUE) OR NOT EXISTS (SELECT 1 FROM organ_match WHERE match_id=NEW.match_id AND match_status='TESTING') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Testing match and active clinician required';
    END IF;
    IF NEW.overall_result='COMPATIBLE' AND (NEW.blood_group_result<>'COMPATIBLE' OR NEW.hla_result<>'COMPATIBLE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatible component results required';
    END IF;
END$$
CREATE TRIGGER trg_compatibility_immutable_update BEFORE UPDATE ON compatibility_test FOR EACH ROW
BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatibility history is append only'; END$$
CREATE TRIGGER trg_compatibility_immutable_delete BEFORE DELETE ON compatibility_test FOR EACH ROW
BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatibility history cannot be deleted'; END$$

CREATE TRIGGER trg_allocation_evidence_guard BEFORE INSERT ON organ_allocation FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM compatibility_test ct JOIN app_user u ON u.user_id=ct.performed_by WHERE ct.test_id=(SELECT test_id FROM compatibility_test WHERE match_id=NEW.match_id ORDER BY test_date DESC,test_id DESC LIMIT 1) AND ct.overall_result='COMPATIBLE' AND ct.blood_group_result='COMPATIBLE' AND ct.hla_result='COMPATIBLE' AND u.role='CLINICIAN' AND u.is_active=TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Compatible clinician evidence required for allocation';
    END IF;
END$

CREATE TRIGGER trg_allocation_transition_guard BEFORE UPDATE ON organ_allocation FOR EACH ROW
BEGIN
    IF NEW.match_id<>OLD.match_id OR (NEW.allocation_status<>OLD.allocation_status AND NOT (OLD.allocation_status='RESERVED' AND NEW.allocation_status IN ('RELEASED','COMPLETED'))) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Invalid allocation identity or transition';
    END IF;
END$$

CREATE TRIGGER trg_transplant_insert_guard BEFORE INSERT ON transplant FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM organ_allocation a JOIN organ_match m ON m.match_id=a.match_id JOIN organ o ON o.organ_id=m.organ_id JOIN waiting_list w ON w.waiting_id=m.waiting_id JOIN active_organ_reservation r ON r.organ_id=o.organ_id AND r.allocation_id=a.allocation_id WHERE a.allocation_id=NEW.allocation_id AND a.allocation_status='RESERVED' AND o.organ_status='RESERVED' AND w.status='MATCHED' AND m.match_status='APPROVED' AND NEW.performed_at>=a.allocated_at AND NEW.performed_at<=UTC_TIMESTAMP()) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Consistent reserved allocation required for transplant';
    END IF;
END$$

CREATE TRIGGER trg_follow_up_insert_guard BEFORE INSERT ON transplant_follow_up FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM app_user WHERE user_id=NEW.recorded_by AND role='CLINICIAN' AND is_active=TRUE) OR NOT EXISTS (SELECT 1 FROM transplant WHERE transplant_id=NEW.transplant_id AND DATE(performed_at)<=NEW.follow_up_date) OR NEW.follow_up_date>UTC_DATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Valid clinician and follow up date required';
    END IF;
END$$

CREATE TRIGGER trg_follow_up_immutable_update BEFORE UPDATE ON transplant_follow_up FOR EACH ROW
BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Follow up history is append only'; END$
CREATE TRIGGER trg_follow_up_immutable_delete BEFORE DELETE ON transplant_follow_up FOR EACH ROW
BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Follow up history cannot be deleted'; END$

DELIMITER ;

INSERT INTO schema_migration (version,description) VALUES ('007','Phase 3E transaction-safe routines, audit/outbox, and additive integrity guards');
