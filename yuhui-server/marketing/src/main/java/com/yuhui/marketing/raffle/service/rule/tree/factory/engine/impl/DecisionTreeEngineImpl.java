package com.yuhui.marketing.raffle.service.rule.tree.factory.engine.impl;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleLogicCheckTypeVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeNodeLineVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeNodeVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeVO;
import com.yuhui.marketing.raffle.service.rule.tree.LogicTree;
import com.yuhui.marketing.raffle.service.rule.tree.factory.DefaultLogicTreeFactory;
import com.yuhui.marketing.raffle.service.rule.tree.factory.engine.DecisionTreeEngine;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

/**

 * 组合规则树（引擎）
 */
@Slf4j
public class DecisionTreeEngineImpl implements DecisionTreeEngine {
    private final Map<String, LogicTree> logicTreeNodeGroup;
    private final RuleTreeVO ruleTreeVO;
    public DecisionTreeEngineImpl(Map<String, LogicTree> logicTreeNodeGroup, RuleTreeVO ruleTreeVO) {
        this.logicTreeNodeGroup = logicTreeNodeGroup;
        this.ruleTreeVO = ruleTreeVO;
    }
    @Override
    public RuleEntity process(String userId, Long strategyId,Long activityId, Long awardId) {
        RuleEntity ruleEntity = null;
        // 1. 获取基础信息（根节点、所有规则树节点的Map集合）
        String nextNode = ruleTreeVO.getTreeRootRuleNode();
        Map<String, RuleTreeNodeVO> treeNodeMap = ruleTreeVO.getTreeNodeMap();
        // 2. 获取起始节点（根节点记录第一个要执行的规则）
        RuleTreeNodeVO ruleTreeNode = treeNodeMap.get(nextNode);
        // 3. 按条件遍历规则树节点
        while (ruleTreeNode!=null) {
            // 3.1. 获取规则树的节点
            LogicTree logicTreeNode = logicTreeNodeGroup.get(ruleTreeNode.getRuleName());
            // 3.2. 节点计算，判断走向
            DefaultLogicTreeFactory.TreeActionEntity logicEntity = logicTreeNode.logic(userId, strategyId,activityId, awardId,ruleTreeNode.getRuleValue());
            RuleLogicCheckTypeVO ruleLogicCheckTypeVO = logicEntity.getRuleLogicCheckType();
            //当前：兜底奖励or通过-次数锁-库存-后的正常奖励
            ruleEntity = logicEntity.getRuleEntity();
            log.debug("[DecisionTreeEngineImpl]决策树引擎【{}】id:{} node:{} code:{}", ruleTreeVO.getTreeName(), ruleTreeVO.getId(), nextNode, ruleLogicCheckTypeVO.getCode());
            // 3.3. 获取下个节点
            nextNode = getNextNode(ruleLogicCheckTypeVO.getCode(), ruleTreeNode.getTreeNodeLineVOList());
            ruleTreeNode = treeNodeMap.get(nextNode);
        }
        // 4. 返回最终结果
        return ruleEntity;
    }
    public String getNextNode(Integer code, List<RuleTreeNodeLineVO> treeNodeLineVOList) {
        if (treeNodeLineVOList==null || treeNodeLineVOList.isEmpty()) {
            return null;
        }
        //当前：一个拦截TAKE_OVER，一个放行ALLOW
        for (RuleTreeNodeLineVO nodeLine : treeNodeLineVOList) {
            if (decisionLogic(code, nodeLine)) {
                return nodeLine.getRuleNodeTo();
            }
        }
        // 否则下面接没有节点了，返回现在获得的奖励即可
        return null;
    }
    public boolean decisionLogic(Integer code, RuleTreeNodeLineVO nodeLine) {
        // 将上级节点返回的状态码 与 从数据库表中获取数据组合成的VO表进行对比，判断下一步走哪个节点
        switch (nodeLine.getRuleLimitType()) {
            case EQUAL:
                return code.equals(nodeLine.getRuleLimitValue().getCode());
            // 以下规则暂时不需要实现
            case GT:
            case LT:
            case GTE:
            case LTE:
            default:
                return false;
        }
    }
}
