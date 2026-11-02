USE organsync_v2;

DELIMITER $$

-- ==========================================
-- 1. Allocate Organ
-- ==========================================

DROP PROCEDURE IF EXISTS sp_allocate_organ$$

CREATE PROCEDURE sp_allocate_organ(
    IN p_match_id BIGINT UNSIGNED
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

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

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
        NOW()
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

    INSERT INTO sync_outbox (
        aggregate_type,
        aggregate_id,
        event_type,
        payload,
        status,
        attempt_count,
        created_at
    )
    VALUES (
        'organ',
        v_organ_id,
        'ORGAN_RESERVED',
        JSON_OBJECT(
            'organ_id', v_organ_id,
            'match_id', p_match_id,
            'allocation_id', v_allocation_id
        ),
        'PENDING',
        0,
        NOW()
    );

    COMMIT;

    SELECT
        v_allocation_id AS allocation_id,
        'Organ allocated successfully' AS message;
END$$


-- ==========================================
-- 2. Release Organ Allocation
-- ==========================================

DROP PROCEDURE IF EXISTS sp_release_allocation$$

CREATE PROCEDURE sp_release_allocation(
    IN p_allocation_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_organ_id BIGINT UNSIGNED;
    DECLARE v_waiting_id BIGINT UNSIGNED;
    DECLARE v_status VARCHAR(20);
    DECLARE v_reservation_id BIGINT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

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
        released_at = NOW()
    WHERE allocation_id = p_allocation_id;

    UPDATE organ
    SET organ_status = 'AVAILABLE'
    WHERE organ_id = v_organ_id;

    UPDATE waiting_list
    SET status = 'ACTIVE'
    WHERE waiting_id = v_waiting_id
        AND status = 'MATCHED';

    INSERT INTO sync_outbox (
        aggregate_type,
        aggregate_id,
        event_type,
        payload,
        status,
        attempt_count,
        created_at
    )
    VALUES (
        'organ',
        v_organ_id,
        'ORGAN_RELEASED',
        JSON_OBJECT(
            'organ_id', v_organ_id,
            'allocation_id', p_allocation_id
        ),
        'PENDING',
        0,
        NOW()
    );

    COMMIT;

    SELECT 'Allocation released successfully' AS message;
END$$


-- ==========================================
-- 3. Record Transplant
-- ==========================================

DROP PROCEDURE IF EXISTS sp_record_transplant$$

CREATE PROCEDURE sp_record_transplant(
    IN p_allocation_id BIGINT UNSIGNED,
    IN p_centre_id BIGINT UNSIGNED,
    IN p_performed_at DATETIME,
    IN p_outcome VARCHAR(30),
    IN p_notes TEXT
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

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

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

    INSERT INTO sync_outbox (
        aggregate_type,
        aggregate_id,
        event_type,
        payload,
        status,
        attempt_count,
        created_at
    )
    VALUES (
        'transplant',
        v_transplant_id,
        'TRANSPLANT_COMPLETED',
        JSON_OBJECT(
            'transplant_id', v_transplant_id,
            'organ_id', v_organ_id,
            'allocation_id', p_allocation_id,
            'centre_id', p_centre_id,
            'outcome', p_outcome
        ),
        'PENDING',
        0,
        NOW()
    );

    COMMIT;

    SELECT
        v_transplant_id AS transplant_id,
        'Transplant recorded successfully' AS message;
END$$

DELIMITER ;


-- ==========================================
-- 4. Verify Stored Procedures
-- ==========================================

SELECT
    ROUTINE_NAME,
    ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'organsync_v2'
    AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;