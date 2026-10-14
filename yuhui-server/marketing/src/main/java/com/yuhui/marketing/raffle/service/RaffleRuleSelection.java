package com.yuhui.marketing.raffle.service;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeVO;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.service.rule.chain.LogicChain;
import com.yuhui.marketing.raffle.service.rule.chain.factory.DefaultLogicChainFactory;
import com.yuhui.marketing.raffle.service.rule.tree.factory.DefaultLogicTreeFactory;
import com.yuhui.marketing.raffle.service.rule.tree.factory.engine.DecisionTreeEngine;
import org.springframework.stereotype.Service;


@Service
public class RaffleRuleSelection {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleRuleTrees ruleTrees;

    private final StrategyRepository repository;
    private final DefaultLogicChainFactory defaultLogicChainFactory;
    private final DefaultLogicTreeFactory defaultLogicTreeFactory;
    public RaffleRuleSelection(StrategyRepository repository, DefaultLogicChainFactory chains, DefaultLogicTreeFactory trees) {
        this.repository = repository; this.defaultLogicChainFactory = chains; this.defaultLogicTreeFactory = trees;
    }
    public RuleEntity select(String userId, Long strategyId, Long activityId) {
        // 1. 获取责任链
        LogicChain logicChain = defaultLogicChainFactory.getLogicChain(strategyId);
        // 2. 依次执行责任链
        return logicChain.logic(userId, strategyId, activityId);
    }

    public RuleEntity resolve(String userId, Long strategyId, Long activityId, Long awardId) {
        Long ruleTreeId = ruleTrees.queryRuleModelVO(activityId, awardId);
        if (ruleTreeId == 0L) {
            return RuleEntity.builder().awardId(awardId).build();
        }
        RuleTreeVO ruleTreeVO = ruleTrees.queryRuleTreeVO(ruleTreeId);
        if (ruleTreeVO == null) {
            throw new RuntimeException("rule tree is not configured, treeId=" + ruleTreeId);
        }
        DecisionTreeEngine decisionTreeEngine = defaultLogicTreeFactory.getLogicTree(ruleTreeVO);
        return decisionTreeEngine.process(userId, strategyId, activityId, awardId);
    }

}
