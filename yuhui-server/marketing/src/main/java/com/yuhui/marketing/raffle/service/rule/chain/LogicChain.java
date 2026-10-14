package com.yuhui.marketing.raffle.service.rule.chain;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
/** A null result means this policy does not take over the draw. */
@FunctionalInterface
public interface LogicChain {
    RuleEntity logic(String userId, Long strategyId, Long activityId);
}
