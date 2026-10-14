package com.yuhui.infrastructure.adapter.repository;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.yuhui.marketing.raffle.model.valobj.RuleLimitTypeVO;
import com.yuhui.marketing.raffle.model.valobj.RuleLogicCheckTypeVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeNodeLineVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeNodeVO;
import com.yuhui.marketing.raffle.model.valobj.RuleTreeVO;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.*;

import com.yuhui.marketing.raffle.repository.RaffleRuleTrees;
@Repository @Slf4j
public class RaffleRuleTreeStore implements RaffleRuleTrees {
    @Resource private StrategyAwardMapper strategyAwardMapper;
    @Resource private RedisService redisService;
    @Resource private RuleTreeMapper ruleTreeMapper;
    @Resource private RuleTreeNodeMapper ruleTreeNodeMapper;
    @Resource private RuleTreeNodeLineMapper ruleTreeNodeLineMapper;
    @Override
    public Long queryRuleModelVO(Long activityId, Long awardId) {
        StrategyAward strategyAward = strategyAwardMapper.selectOne(new QueryWrapper<StrategyAward>().lambda()
                .eq(StrategyAward::getActivityId, activityId)
                .eq(StrategyAward::getAwardId, awardId));
        if (strategyAward == null || strategyAward.getRuleTreeId() == null) {
            return 0L;
        }
        return strategyAward.getRuleTreeId();
    }

    @Override
    public RuleTreeVO queryRuleTreeVO(Long treeId) {
        String cacheKey = Constants.RedisKey.RULE_TREE_KEY + treeId;
        RuleTreeVO ruleTreeVOCache = redisService.getValue(cacheKey);
        if (ruleTreeVOCache != null) {
            return ruleTreeVOCache;
        }

        RuleTree ruleTree = ruleTreeMapper.selectOne(new QueryWrapper<RuleTree>().lambda().eq(RuleTree::getId, treeId));
        if (ruleTree == null) {
            return null;
        }

        List<RuleTreeNode> ruleTreeNodes = ruleTreeNodeMapper.selectList(new QueryWrapper<RuleTreeNode>().lambda()
                .eq(RuleTreeNode::getRuleTreeId, treeId));
        List<RuleTreeNodeLine> ruleTreeNodeLines = ruleTreeNodeLineMapper.selectList(new QueryWrapper<RuleTreeNodeLine>().lambda()
                .eq(RuleTreeNodeLine::getRuleTreeId, treeId));

        Map<String, List<RuleTreeNodeLineVO>> ruleTreeNodeLineMap = new HashMap<>();
        for (RuleTreeNodeLine ruleTreeNodeLine : ruleTreeNodeLines) {
            RuleTreeNodeLineVO ruleTreeNodeLineVO = RuleTreeNodeLineVO.builder()
                    .ruleTreeId(ruleTreeNodeLine.getRuleTreeId())
                    .ruleNodeFrom(ruleTreeNodeLine.getRuleNodeFrom())
                    .ruleNodeTo(ruleTreeNodeLine.getRuleNodeTo())
                    .ruleLimitType(RuleLimitTypeVO.valueOf(ruleTreeNodeLine.getRuleLimitType()))
                    .ruleLimitValue(RuleLogicCheckTypeVO.valueOf(ruleTreeNodeLine.getRuleLimitValue()))
                    .build();
            ruleTreeNodeLineMap.computeIfAbsent(ruleTreeNodeLine.getRuleNodeFrom(), k -> new ArrayList<>()).add(ruleTreeNodeLineVO);
        }

        Map<String, RuleTreeNodeVO> ruleTreeNodeMap = new HashMap<>();
        for (RuleTreeNode ruleTreeNode : ruleTreeNodes) {
            RuleTreeNodeVO ruleTreeNodeVO = RuleTreeNodeVO.builder()
                    .ruleTreeId(ruleTreeNode.getRuleTreeId())
                    .ruleName(ruleTreeNode.getRuleName())
                    .ruleDesc(ruleTreeNode.getRuleDesc())
                    .ruleValue(ruleTreeNode.getRuleValue())
                    .treeNodeLineVOList(ruleTreeNodeLineMap.get(ruleTreeNode.getRuleName()))
                    .build();
            ruleTreeNodeMap.put(ruleTreeNode.getRuleName(), ruleTreeNodeVO);
        }

        RuleTreeVO ruleTreeVO = RuleTreeVO.builder()
                .id(ruleTree.getId())
                .treeName(ruleTree.getTreeName())
                .treeDesc(ruleTree.getTreeDesc())
                .treeRootRuleNode(ruleTree.getTreeNodeRuleKey())
                .treeNodeMap(ruleTreeNodeMap)
                .build();
        redisService.setValue(cacheKey, ruleTreeVO);
        return ruleTreeVO;
    }

    @Override
    public void deleteCacheKeyByTreeId(Long treeId) {
        redisService.remove(Constants.RedisKey.RULE_TREE_KEY + treeId);
    }
}
