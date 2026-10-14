-- Incremental and repeatable; existing published versions/ledgers are untouched.
USE marketing;
DROP PROCEDURE IF EXISTS migrate_v3_final_patch;
DELIMITER $$
CREATE PROCEDURE migrate_v3_final_patch()
BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='v3_campaign' AND column_name='review_config_json') THEN
  ALTER TABLE v3_campaign ADD COLUMN review_config_json JSON NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='v3_campaign' AND column_name='review_config_hash') THEN
  ALTER TABLE v3_campaign ADD COLUMN review_config_hash CHAR(64) NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='v3_campaign' AND column_name='review_submitted_at') THEN
  ALTER TABLE v3_campaign ADD COLUMN review_submitted_at DATETIME NULL;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='v3_campaign' AND column_name='review_approved_at') THEN
  ALTER TABLE v3_campaign ADD COLUMN review_approved_at DATETIME NULL;
 END IF;
 -- Old pending/approved records have no reviewed payload: explicitly require resubmission.
 UPDATE v3_campaign SET status='DRAFT' WHERE status IN ('PENDING_REVIEW','APPROVED') AND review_config_hash IS NULL;
END$$
CALL migrate_v3_final_patch()$$
DROP PROCEDURE migrate_v3_final_patch$$
DELIMITER ;
