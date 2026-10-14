package com.yuhui.marketing.raffle.service;

import com.yuhui.marketing.raffle.model.valobj.RuleWeightVO;

import java.util.List;
import java.util.Map;

/**

 * 策略-抽奖领域-规则相关操作
 */
public interface Rule {
    Map<Long, Integer> queryAwardRuleLockCount(Long[] treeIds);

    List<RuleWeightVO> queryStrategyRuleWeight(Long activityId);
}
