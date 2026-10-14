package com.yuhui.marketing.raffle.service.rule.tree.factory;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleLogicCheckTypeVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeVO;
import com.yuhui.marketing.raffle.service.rule.tree.LogicTree;
import com.yuhui.marketing.raffle.service.rule.tree.factory.engine.DecisionTreeEngine;
import com.yuhui.marketing.raffle.service.rule.tree.factory.engine.impl.DecisionTreeEngineImpl;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Map;

/**

 * 规则树工厂
 */
@Service
public class DefaultLogicTreeFactory {
    private final Map<String, LogicTree> logicTreeNodeGroup;
    public DefaultLogicTreeFactory(Map<String, LogicTree> logicTreeNodeGroup) {
        this.logicTreeNodeGroup = logicTreeNodeGroup;
    }
    public DecisionTreeEngine getLogicTree(RuleTreeVO ruleTreeVO) {
        return new DecisionTreeEngineImpl(logicTreeNodeGroup, ruleTreeVO);
    }

    /**
     * 决策树动作实体
     */
    @Data
    @Builder
    public static class TreeActionEntity {
        private RuleLogicCheckTypeVO ruleLogicCheckType;
        private RuleEntity ruleEntity;
    }
}
