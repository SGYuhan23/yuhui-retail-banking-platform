package com.yuhui.marketing.raffle.service.rule.tree.factory.engine;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;

/**

 * 组合规则树接口（引擎）
 */
public interface DecisionTreeEngine {
    RuleEntity process(String userId, Long strategyId,Long activityId, Long awardId);
}
