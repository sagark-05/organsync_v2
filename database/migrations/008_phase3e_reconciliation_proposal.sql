-- PROPOSAL ONLY: requires explicit approval before application.
-- The live 007 ledger entry exists, but four intended guards are absent.
-- 007 contains malformed END$ terminators. Do not rewrite or rerun it.
-- Recheck metadata before applying; stop if any object below already exists.
-- Execute statements sequentially and STOP on the first SQL error.
USE organsync_v2;
DELIMITER $$

CREATE TRIGGER trg_allocation_evidence_guard
BEFORE INSERT ON organ_allocation FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM compatibility_test ct
        JOIN app_user u ON u.user_id=ct.performed_by
        WHERE ct.test_id=(
            SELECT test_id FROM compatibility_test
            WHERE match_id=NEW.match_id
            ORDER BY test_date DESC,test_id DESC LIMIT 1
        )
        AND ct.overall_result='COMPATIBLE'
        AND ct.blood_group_result='COMPATIBLE'
        AND ct.hla_result='COMPATIBLE'
        AND u.role='CLINICIAN' AND u.is_active=TRUE
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Compatible clinician evidence required for allocation';
    END IF;
END$$

CREATE TRIGGER trg_allocation_transition_guard
BEFORE UPDATE ON organ_allocation FOR EACH ROW
BEGIN
    IF NEW.match_id<>OLD.match_id OR (
        NEW.allocation_status<>OLD.allocation_status
        AND NOT (
            OLD.allocation_status='RESERVED'
            AND NEW.allocation_status IN ('RELEASED','COMPLETED')
        )
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Invalid allocation identity or transition';
    END IF;
END$$

CREATE TRIGGER trg_follow_up_immutable_update
BEFORE UPDATE ON transplant_follow_up FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT='Follow up history is append only';
END$$

CREATE TRIGGER trg_follow_up_immutable_delete
BEFORE DELETE ON transplant_follow_up FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT='Follow up history cannot be deleted';
END$$

DELIMITER ;
INSERT INTO schema_migration (version,description)
VALUES ('008','Reconcile missing Phase3E allocation and follow-up integrity triggers');
