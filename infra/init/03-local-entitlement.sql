CREATE TABLE IF NOT EXISTS marketing.local_entitlement (
  user_order_id BIGINT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  activity_id BIGINT NOT NULL,
  award_id BIGINT NOT NULL,
  award_key VARCHAR(32) NOT NULL,
  award_config VARCHAR(256) NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user(user_id)
) COMMENT='Local-only AI/VIP award ledger; no external service is called';
