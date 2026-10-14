USE marketing;
CREATE TABLE IF NOT EXISTS v3_customer (
 customer_id VARCHAR(40) PRIMARY KEY, mock_flag BOOLEAN NOT NULL DEFAULT TRUE,
 district VARCHAR(40) NOT NULL, asset_tier VARCHAR(8) NOT NULL, lifecycle_stage VARCHAR(16) NOT NULL,
 last_active_at DATETIME NOT NULL, last_active_days INT NOT NULL, activity_level_30d INT NOT NULL,
 points_balance INT NOT NULL, expiring_points INT NOT NULL, preferred_scene VARCHAR(32) NOT NULL,
 preferred_benefit_type VARCHAR(32) NOT NULL, marketing_consent BOOLEAN NOT NULL,
 created_at DATETIME NOT NULL, source_version VARCHAR(64) NOT NULL,
 INDEX idx_segment(district, preferred_scene,marketing_consent)
);
CREATE TABLE IF NOT EXISTS v3_segment (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, rule_json JSON NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS v3_segment_snapshot (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, segment_id BIGINT NOT NULL, snapshot_name VARCHAR(160) NOT NULL,
 customer_count INT NOT NULL, rule_snapshot JSON NOT NULL, source_version VARCHAR(64) NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(segment_id) REFERENCES v3_segment(id)
);
CREATE TABLE IF NOT EXISTS v3_segment_snapshot_member (
 snapshot_id BIGINT NOT NULL, customer_id VARCHAR(40) NOT NULL, frozen_attributes_json JSON NOT NULL,
 PRIMARY KEY(snapshot_id,customer_id), FOREIGN KEY(snapshot_id) REFERENCES v3_segment_snapshot(id),
 FOREIGN KEY(customer_id) REFERENCES v3_customer(customer_id)
);
CREATE TABLE IF NOT EXISTS v3_scene (id VARCHAR(32) PRIMARY KEY,name VARCHAR(80) NOT NULL);
CREATE TABLE IF NOT EXISTS v3_merchant (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, mock_flag BOOLEAN NOT NULL DEFAULT TRUE,
 district VARCHAR(40) NOT NULL, scene_id VARCHAR(32) NOT NULL, category VARCHAR(40) NOT NULL,status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
 FOREIGN KEY(scene_id) REFERENCES v3_scene(id)
);
CREATE TABLE IF NOT EXISTS v3_benefit (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,scene_id VARCHAR(32) NOT NULL,
 type VARCHAR(32) NOT NULL, face_value BIGINT NOT NULL,minimum_spend BIGINT NOT NULL,
 bank_cost BIGINT NOT NULL,merchant_cost BIGINT NOT NULL,points_price INT NOT NULL DEFAULT 0,
 valid_days INT NOT NULL,total_stock INT NOT NULL,issued_stock INT NOT NULL DEFAULT 0,status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
 FOREIGN KEY(scene_id) REFERENCES v3_scene(id),CHECK(bank_cost>=0 AND merchant_cost>=0 AND total_stock>=issued_stock)
);
CREATE TABLE IF NOT EXISTS v3_campaign (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(160) NOT NULL,status VARCHAR(24) NOT NULL DEFAULT 'DRAFT',config_json JSON NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS v3_campaign_version (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,campaign_id BIGINT NOT NULL,segment_snapshot_id BIGINT NOT NULL,config_json JSON NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(campaign_id) REFERENCES v3_campaign(id),
 FOREIGN KEY(segment_snapshot_id) REFERENCES v3_segment_snapshot(id)
);
CREATE TABLE IF NOT EXISTS v3_campaign_run (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,campaign_id BIGINT NOT NULL,campaign_version_id BIGINT NOT NULL,segment_snapshot_id BIGINT NOT NULL,
 status VARCHAR(24) NOT NULL,start_time DATETIME NOT NULL,end_time DATETIME NOT NULL,budget_total BIGINT NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(campaign_id) REFERENCES v3_campaign(id),
 FOREIGN KEY(campaign_version_id) REFERENCES v3_campaign_version(id),FOREIGN KEY(segment_snapshot_id) REFERENCES v3_segment_snapshot(id)
);
CREATE TABLE IF NOT EXISTS v3_campaign_budget (
 campaign_run_id BIGINT PRIMARY KEY,total BIGINT NOT NULL,CHECK(total>=0),FOREIGN KEY(campaign_run_id) REFERENCES v3_campaign_run(id)
);
CREATE TABLE IF NOT EXISTS v3_entitlement (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,code VARCHAR(64) NOT NULL UNIQUE,campaign_run_id BIGINT NOT NULL,
 customer_id VARCHAR(40) NOT NULL,benefit_id BIGINT NOT NULL,merchant_id BIGINT NOT NULL,
 status VARCHAR(16) NOT NULL,terms_json JSON NOT NULL,bank_cost BIGINT NOT NULL,merchant_cost BIGINT NOT NULL,points_spent INT NOT NULL DEFAULT 0,
 claimed_at DATETIME NOT NULL,expires_at DATETIME NOT NULL,redeemed_at DATETIME NULL,
 UNIQUE KEY uk_claim(campaign_run_id,customer_id,benefit_id),FOREIGN KEY(campaign_run_id) REFERENCES v3_campaign_run(id),
 FOREIGN KEY(customer_id) REFERENCES v3_customer(customer_id),FOREIGN KEY(benefit_id) REFERENCES v3_benefit(id),FOREIGN KEY(merchant_id) REFERENCES v3_merchant(id)
);
CREATE TABLE IF NOT EXISTS v3_budget_ledger (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,campaign_run_id BIGINT NOT NULL,customer_id VARCHAR(40) NOT NULL,benefit_id BIGINT NOT NULL,
 operation_type VARCHAR(16) NOT NULL,reserved_delta BIGINT NOT NULL,committed_delta BIGINT NOT NULL,
 bank_amount BIGINT NOT NULL,business_ref_id VARCHAR(64) NOT NULL,idempotency_key VARCHAR(160) NOT NULL UNIQUE,
 created_at DATETIME NOT NULL,FOREIGN KEY(campaign_run_id) REFERENCES v3_campaign_run(id)
);
CREATE TABLE IF NOT EXISTS v3_event_ledger (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,campaign_id BIGINT NOT NULL,campaign_run_id BIGINT NOT NULL,customer_id VARCHAR(40) NOT NULL,
 segment_snapshot_id BIGINT NOT NULL,event_type VARCHAR(40) NOT NULL,merchant_id BIGINT NULL,scene_id VARCHAR(32) NOT NULL,
 benefit_id BIGINT NOT NULL,bank_cost BIGINT NOT NULL DEFAULT 0,merchant_cost BIGINT NOT NULL DEFAULT 0,
 business_ref_id VARCHAR(64) NOT NULL,idempotency_key VARCHAR(160) NOT NULL UNIQUE,occurred_at DATETIME NOT NULL,metadata_json JSON NOT NULL,
 INDEX idx_run_type(campaign_run_id,event_type,customer_id),FOREIGN KEY(campaign_run_id) REFERENCES v3_campaign_run(id)
);
CREATE TABLE IF NOT EXISTS v3_decision_record (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,campaign_run_id BIGINT NOT NULL,decision_type VARCHAR(16) NOT NULL,reason TEXT NOT NULL,
 metrics_snapshot_json JSON NOT NULL,created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(campaign_run_id) REFERENCES v3_campaign_run(id)
);

-- Immutable historical facts. Only the explicit V3 reset transaction may delete them.
DELIMITER $$
DROP TRIGGER IF EXISTS v3_immutable_segment_snapshot_update$$
CREATE TRIGGER v3_immutable_segment_snapshot_update BEFORE UPDATE ON v3_segment_snapshot FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_segment_snapshot_delete$$
CREATE TRIGGER v3_immutable_segment_snapshot_delete BEFORE DELETE ON v3_segment_snapshot FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_segment_snapshot_member_update$$
CREATE TRIGGER v3_immutable_segment_snapshot_member_update BEFORE UPDATE ON v3_segment_snapshot_member FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_segment_snapshot_member_delete$$
CREATE TRIGGER v3_immutable_segment_snapshot_member_delete BEFORE DELETE ON v3_segment_snapshot_member FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_campaign_version_update$$
CREATE TRIGGER v3_immutable_campaign_version_update BEFORE UPDATE ON v3_campaign_version FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_campaign_version_delete$$
CREATE TRIGGER v3_immutable_campaign_version_delete BEFORE DELETE ON v3_campaign_version FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_budget_ledger_update$$
CREATE TRIGGER v3_immutable_budget_ledger_update BEFORE UPDATE ON v3_budget_ledger FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_budget_ledger_delete$$
CREATE TRIGGER v3_immutable_budget_ledger_delete BEFORE DELETE ON v3_budget_ledger FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_event_ledger_update$$
CREATE TRIGGER v3_immutable_event_ledger_update BEFORE UPDATE ON v3_event_ledger FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_event_ledger_delete$$
CREATE TRIGGER v3_immutable_event_ledger_delete BEFORE DELETE ON v3_event_ledger FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_decision_record_update$$
CREATE TRIGGER v3_immutable_decision_record_update BEFORE UPDATE ON v3_decision_record FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_immutable_decision_record_delete$$
CREATE TRIGGER v3_immutable_decision_record_delete BEFORE DELETE ON v3_decision_record FOR EACH ROW BEGIN IF COALESCE(@v3_reset,0) <> 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='V3 historical facts are immutable'; END IF; END$$
DROP TRIGGER IF EXISTS v3_frozen_member_insert$$
CREATE TRIGGER v3_frozen_member_insert BEFORE INSERT ON v3_segment_snapshot_member FOR EACH ROW BEGIN IF EXISTS(SELECT 1 FROM v3_campaign_version WHERE segment_snapshot_id=NEW.snapshot_id) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Published snapshot membership is frozen'; END IF; END$$
DELIMITER ;
