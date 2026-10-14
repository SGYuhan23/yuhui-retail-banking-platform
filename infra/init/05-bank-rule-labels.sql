USE marketing;
START TRANSACTION;
UPDATE rule_tree SET tree_name=REPLACE(tree_name,'ai-agent_tree','权益发放 · '), tree_desc=REPLACE(tree_desc,'ai-agent_tree','权益发放 · ') WHERE id IN (1989339772170756097,1989339871722561537,1989339936365174786,1989339970464866305) AND tree_name LIKE 'ai-agent_tree%';
UPDATE strategy SET strategy_desc='渝惠积分权益抽奖策略' WHERE id=1989339401985679361 AND strategy_desc='ai-agent项目抽奖策略';
UPDATE rule_tree_node SET rule_desc='权益直接发放节点' WHERE id IN (1990305628043874306,1990305705537835010) AND rule_desc='ai-agent_tree无规则节点';
INSERT IGNORE INTO replica_migration(version) VALUES('bank-rule-labels-v1');
COMMIT;
