USE marketing;
CREATE TABLE IF NOT EXISTS replica_migration (version VARCHAR(64) PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS local_entitlement_redemption (user_order_id BIGINT PRIMARY KEY, user_id VARCHAR(64) NOT NULL, redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP);
DELIMITER $$
DROP PROCEDURE IF EXISTS apply_bank_v1$$
CREATE PROCEDURE apply_bank_v1()
BEGIN
IF NOT EXISTS (SELECT 1 FROM replica_migration WHERE version='bank-v1') THEN
START TRANSACTION;
UPDATE activity SET activity_name='渝惠生活 · 积分好礼季', activity_desc='每日签到积累积分，兑换抽奖机会，解锁便民生活与出行礼遇。个人项目演示。' WHERE id=1989345533881966594;
UPDATE award SET award_desc='便民生活券 · 1张', image='/assets/bank-1989336435136356353.svg', award_key='bank_coupon', award_config='1' WHERE id=1989336435136356353;
UPDATE activity_award SET award_title='便民生活券 · 1张' WHERE award_id=1989336435136356353;
UPDATE award SET award_desc='便民生活券 · 5张', image='/assets/bank-1989336788581965826.svg', award_key='bank_coupon', award_config='5' WHERE id=1989336788581965826;
UPDATE activity_award SET award_title='便民生活券 · 5张' WHERE award_id=1989336788581965826;
UPDATE award SET award_desc='出行礼遇 · 周卡', image='/assets/bank-1989337375050522625.svg', award_key='bank_service', award_config='7' WHERE id=1989337375050522625;
UPDATE activity_award SET award_title='出行礼遇 · 周卡' WHERE award_id=1989337375050522625;
UPDATE award SET award_desc='出行礼遇 · 月卡', image='/assets/bank-1989337465119006721.svg', award_key='bank_service', award_config='30' WHERE id=1989337465119006721;
UPDATE activity_award SET award_title='出行礼遇 · 月卡' WHERE award_id=1989337465119006721;
UPDATE award SET award_desc='惊喜积分', image='/assets/bank-1989336702498070529.svg' WHERE id=1989336702498070529;
UPDATE activity_award SET award_title='惊喜积分' WHERE award_id=1989336702498070529;
UPDATE award SET award_desc='幸运机会 · 1次', image='/assets/bank-1989336928877240321.svg' WHERE id=1989336928877240321;
UPDATE activity_award SET award_title='幸运机会 · 1次' WHERE award_id=1989336928877240321;
UPDATE award SET award_desc='幸运机会 · 5次', image='/assets/bank-1989336991691137026.svg' WHERE id=1989336991691137026;
UPDATE activity_award SET award_title='幸运机会 · 5次' WHERE award_id=1989336991691137026;
UPDATE award SET award_desc='谢谢参与', image='/assets/bank-1989337068971188225.svg' WHERE id=1989337068971188225;
UPDATE activity_award SET award_title='谢谢参与' WHERE award_id=1989337068971188225;
UPDATE award SET award_desc='关怀积分', image='/assets/bank-1934859819538202696.svg' WHERE id=1934859819538202696;
UPDATE activity_award SET award_title='关怀积分' WHERE award_id=1934859819538202696;
INSERT INTO replica_migration(version) VALUES('bank-v1');
COMMIT;
END IF;
END$$
CALL apply_bank_v1()$$
DROP PROCEDURE apply_bank_v1$$
DELIMITER ;
