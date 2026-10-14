package com.yuhui.marketing.raffle.repository;

import com.yuhui.marketing.raffle.model.valobj.RuleTreeVO;


/** Narrow port for RaffleRuleTrees; no catalog or unrelated storage dependencies. */
public interface RaffleRuleTrees {
    Long queryRuleModelVO(Long activityId, Long awardId);
    RuleTreeVO queryRuleTreeVO(Long treeId);
    void deleteCacheKeyByTreeId(Long treeId);
}
