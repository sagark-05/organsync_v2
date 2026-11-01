USE organsync_v2;

DELIMITER $$

-- ==========================================
-- 1. Validate Organ Match (INSERT)
-- ==========================================

DROP TRIGGER IF EXISTS trg_match_validate_insert$$

CREATE TRIGGER trg_match_validate_insert
BEFORE INSERT ON organ_match
FOR EACH ROW
BEGIN
    DECLARE v_waiting_type SMALLINT UNSIGNED;
    DECLARE v_organ_type SMALLINT UNSIGNED;

    SELECT organ_type_id
    INTO v_waiting_type
    FROM waiting_list
    WHERE waiting_id = NEW.waiting_id;

    SELECT organ_type_id
    INTO v_organ_type
    FROM organ
    WHERE organ_id = NEW.organ_id;

    IF v_waiting_type IS NULL
       OR v_organ_type IS NULL
       OR v_waiting_type <> v_organ_type THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Organ type does not match waiting list';
    END IF;
END$$


-- ==========================================
-- 2. Validate Organ Match (UPDATE)
-- ==========================================

DROP TRIGGER IF EXISTS trg_match_validate_update$$

CREATE TRIGGER trg_match_validate_update
BEFORE UPDATE ON organ_match
FOR EACH ROW
BEGIN
    DECLARE v_waiting_type SMALLINT UNSIGNED;
    DECLARE v_organ_type SMALLINT UNSIGNED;
    DECLARE v_latest_result VARCHAR(20);

    SELECT organ_type_id
    INTO v_waiting_type
    FROM waiting_list
    WHERE waiting_id = NEW.waiting_id;

    SELECT organ_type_id
    INTO v_organ_type
    FROM organ
    WHERE organ_id = NEW.organ_id;

    IF v_waiting_type IS NULL
       OR v_organ_type IS NULL
       OR v_waiting_type <> v_organ_type THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Organ type does not match waiting list';
    END IF;

    -- Only an approved-compatible assessment
    -- can move a match to APPROVED.

    IF NEW.match_status = 'APPROVED'
       AND OLD.match_status <> 'APPROVED' THEN

        SET v_latest_result = NULL;

        SELECT overall_result
        INTO v_latest_result
        FROM compatibility_test
        WHERE match_id = OLD.match_id
        ORDER BY test_date DESC, test_id DESC
        LIMIT 1;

        IF v_latest_result IS NULL
           OR v_latest_result <> 'COMPATIBLE' THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT =
                'Latest compatibility test must be compatible';
        END IF;
    END IF;
END$$


-- ==========================================
-- 3. Validate Allocation (INSERT)
-- ==========================================

DROP TRIGGER IF EXISTS trg_allocation_validate_insert$$

CREATE TRIGGER trg_allocation_validate_insert
BEFORE INSERT ON organ_allocation
FOR EACH ROW
BEGIN
    DECLARE v_match_status VARCHAR(20);
    DECLARE v_organ_status VARCHAR(20);
    DECLARE v_waiting_status VARCHAR(20);
    DECLARE v_existing INT DEFAULT 0;

    SELECT
        m.match_status,
        o.organ_status,
        w.status
    INTO
        v_match_status,
        v_organ_status,
        v_waiting_status
    FROM organ_match m
    JOIN organ o ON o.organ_id = m.organ_id
    JOIN waiting_list w ON w.waiting_id = m.waiting_id
    WHERE m.match_id = NEW.match_id;

    IF v_match_status <> 'APPROVED'
       OR v_organ_status <> 'AVAILABLE'
       OR v_waiting_status <> 'ACTIVE' THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Match is not eligible for allocation';
    END IF;

    SELECT COUNT(*)
    INTO v_existing
    FROM organ_allocation
    WHERE match_id = NEW.match_id
      AND allocation_status = 'RESERVED';

    IF v_existing > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Match already has an active allocation';
    END IF;
END$$


-- ==========================================
-- 4. Validate Active Reservation (INSERT)
-- ==========================================

DROP TRIGGER IF EXISTS trg_reservation_validate_insert$$

CREATE TRIGGER trg_reservation_validate_insert
BEFORE INSERT ON active_organ_reservation
FOR EACH ROW
BEGIN
    DECLARE v_expected_organ BIGINT UNSIGNED;
    DECLARE v_allocation_status VARCHAR(20);

    SELECT
        m.organ_id,
        a.allocation_status
    INTO
        v_expected_organ,
        v_allocation_status
    FROM organ_allocation a
    JOIN organ_match m ON m.match_id = a.match_id
    WHERE a.allocation_id = NEW.allocation_id;

    IF v_expected_organ IS NULL
       OR v_expected_organ <> NEW.organ_id
       OR v_allocation_status <> 'RESERVED' THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Invalid active organ reservation';
    END IF;
END$$


-- ==========================================
-- 5. Prevent Duplicate Transplant Records
-- ==========================================

DROP TRIGGER IF EXISTS trg_transplant_record_validate_insert$$

CREATE TRIGGER trg_transplant_record_validate_insert
BEFORE INSERT ON organ_transplant_record
FOR EACH ROW
BEGIN
    DECLARE v_expected_organ BIGINT UNSIGNED;

    SELECT m.organ_id
    INTO v_expected_organ
    FROM transplant t
    JOIN organ_allocation a
        ON a.allocation_id = t.allocation_id
    JOIN organ_match m
        ON m.match_id = a.match_id
    WHERE t.transplant_id = NEW.transplant_id;

    IF v_expected_organ IS NULL
       OR v_expected_organ <> NEW.organ_id THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Transplant record organ mismatch';
    END IF;
END$$


-- ==========================================
-- 6. Prevent Changes to Completed Transplants
-- ==========================================

DROP TRIGGER IF EXISTS trg_transplant_prevent_update$$

CREATE TRIGGER trg_transplant_prevent_update
BEFORE UPDATE ON transplant
FOR EACH ROW
BEGIN
    IF NEW.allocation_id <> OLD.allocation_id THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'Cannot change transplant allocation';
    END IF;
END$$


-- ==========================================
-- 7. Prevent Deletion of Transplant Records
-- ==========================================

DROP TRIGGER IF EXISTS trg_transplant_prevent_delete$$

CREATE TRIGGER trg_transplant_prevent_delete
BEFORE DELETE ON transplant
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT =
        'Transplant records cannot be deleted';
END$$


-- ==========================================
-- 8. Prevent Deletion of Permanent Organ Records
-- ==========================================

DROP TRIGGER IF EXISTS trg_organ_transplant_prevent_delete$$

CREATE TRIGGER trg_organ_transplant_prevent_delete
BEFORE DELETE ON organ_transplant_record
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT =
        'Permanent transplant records cannot be deleted';
END$$


-- ==========================================
-- 9. Prevent Invalid Organ Status Transitions
-- ==========================================

DROP TRIGGER IF EXISTS trg_organ_status_validate$$

CREATE TRIGGER trg_organ_status_validate
BEFORE UPDATE ON organ
FOR EACH ROW
BEGIN
    IF NEW.organ_status <> OLD.organ_status THEN

        IF NOT (
            (OLD.organ_status = 'AVAILABLE'
             AND NEW.organ_status IN ('RESERVED', 'DISCARDED'))

            OR

            (OLD.organ_status = 'RESERVED'
             AND NEW.organ_status IN ('AVAILABLE', 'TRANSPLANTED'))
        ) THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT =
                'Invalid organ status transition';
        END IF;
    END IF;
END$$


-- ==========================================
-- 10. Prevent Invalid Waiting List Transitions
-- ==========================================

DROP TRIGGER IF EXISTS trg_waiting_status_validate$$

CREATE TRIGGER trg_waiting_status_validate
BEFORE UPDATE ON waiting_list
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN

        IF NOT (
            (OLD.status = 'ACTIVE'
             AND NEW.status IN ('MATCHED', 'CANCELLED'))

            OR

            (OLD.status = 'MATCHED'
             AND NEW.status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
        ) THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT =
                'Invalid waiting list status transition';
        END IF;
    END IF;
END$$

DELIMITER ;


-- ==========================================
-- 11. Verify Created Triggers
-- ==========================================

SELECT
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'organsync_v2'
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;