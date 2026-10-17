-- Repair only known demo labels imported through a latin1 client.
-- Correct or manually edited labels are untouched. No amounts, odds, stocks or orders change.
SET NAMES utf8mb4;
USE marketing;
START TRANSACTION;
UPDATE activity SET activity_name='渝惠生活 · 积分好礼季' WHERE id=1989345533881966594 AND BINARY activity_name=BINARY CONVERT(CONVERT(CAST('渝惠生活 · 积分好礼季' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity SET activity_desc='每日签到积累积分，兑换抽奖机会，解锁便民生活与出行礼遇。个人项目演示。' WHERE id=1989345533881966594 AND BINARY activity_desc=BINARY CONVERT(CONVERT(CAST('每日签到积累积分，兑换抽奖机会，解锁便民生活与出行礼遇。个人项目演示。' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='便民生活券 · 1张' WHERE id=1989336435136356353 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('便民生活券 · 1张' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='便民生活券 · 1张' WHERE award_id=1989336435136356353 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('便民生活券 · 1张' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='便民生活券 · 5张' WHERE id=1989336788581965826 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('便民生活券 · 5张' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='便民生活券 · 5张' WHERE award_id=1989336788581965826 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('便民生活券 · 5张' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='出行礼遇 · 周卡' WHERE id=1989337375050522625 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('出行礼遇 · 周卡' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='出行礼遇 · 周卡' WHERE award_id=1989337375050522625 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('出行礼遇 · 周卡' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='出行礼遇 · 月卡' WHERE id=1989337465119006721 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('出行礼遇 · 月卡' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='出行礼遇 · 月卡' WHERE award_id=1989337465119006721 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('出行礼遇 · 月卡' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='惊喜积分' WHERE id=1989336702498070529 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('惊喜积分' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='惊喜积分' WHERE award_id=1989336702498070529 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('惊喜积分' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='幸运机会 · 1次' WHERE id=1989336928877240321 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('幸运机会 · 1次' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='幸运机会 · 1次' WHERE award_id=1989336928877240321 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('幸运机会 · 1次' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='幸运机会 · 5次' WHERE id=1989336991691137026 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('幸运机会 · 5次' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='幸运机会 · 5次' WHERE award_id=1989336991691137026 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('幸运机会 · 5次' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='谢谢参与' WHERE id=1989337068971188225 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('谢谢参与' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='谢谢参与' WHERE award_id=1989337068971188225 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('谢谢参与' AS BINARY) USING latin1) USING utf8mb4);
UPDATE award SET award_desc='关怀积分' WHERE id=1934859819538202696 AND BINARY award_desc=BINARY CONVERT(CONVERT(CAST('关怀积分' AS BINARY) USING latin1) USING utf8mb4);
UPDATE activity_award SET award_title='关怀积分' WHERE award_id=1934859819538202696 AND BINARY award_title=BINARY CONVERT(CONVERT(CAST('关怀积分' AS BINARY) USING latin1) USING utf8mb4);
COMMIT;
