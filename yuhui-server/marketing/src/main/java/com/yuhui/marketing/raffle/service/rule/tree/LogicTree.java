package com.yuhui.marketing.raffle.service.rule.tree;

import com.yuhui.marketing.raffle.service.rule.tree.factory.DefaultLogicTreeFactory;

/**

 * 规则树接口
 */
public interface LogicTree {
    DefaultLogicTreeFactory.TreeActionEntity logic(String userId, Long strategyId,Long activityId, Long awardId, String ruleValue);
}
