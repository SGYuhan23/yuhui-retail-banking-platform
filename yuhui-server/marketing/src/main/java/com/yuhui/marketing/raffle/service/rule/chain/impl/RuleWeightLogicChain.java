package com.yuhui.marketing.raffle.service.rule.chain.impl;

import com.yuhui.marketing.participation.service.ActivityQuotaService;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.service.armory.StrategyService;
import com.yuhui.marketing.raffle.service.rule.chain.LogicChain;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**

 * 抽奖前-权重责任链
 */
@Slf4j
@Component(Constants.RuleModel.RULE_WIGHT)
public class RuleWeightLogicChain implements LogicChain {

    @Resource
    private StrategyRepository repository;

    @Resource
    private StrategyService strategyService;

    @Resource
    private ActivityQuotaService activityQuotaService;

    @Override
    public RuleEntity logic(String userId, Long strategyId, Long activityId) {
        log.info("【抽奖责任链-RuleWeightLogicChain】-权重开始 userId:{} strategyId:{} activityId:{}", userId, strategyId, activityId);

        String ruleValue = repository.queryStrategyRuleValue(strategyId, Constants.RuleModel.RULE_WIGHT);

        Integer userScore = activityQuotaService.queryTotalUserLotteryCount(userId, activityId);

        // 1. 处理规则模型的值，如果规则模型没有值，直接放行
        Map<Long, String> analyticalValueGroup = getAnalyticalValue(ruleValue);
        if (analyticalValueGroup == null || analyticalValueGroup.isEmpty()) {
            return null;
        }

        // The rule matches an exact participation count, not the nearest lower threshold.
        String matchedRule=analyticalValueGroup.get(Long.valueOf(userScore));

        if (matchedRule != null) {
            Long awardId = strategyService.getRandomAwardId(activityId, matchedRule);
            log.info("【抽奖责任链-RuleWeightLogicChain】-权重接管 userId:{} strategyId:{} activityId:{} awardId:{}", userId, strategyId, activityId, awardId);
            return RuleEntity.builder()
                    .awardId(awardId)
                    .ruleModel(Constants.RuleModel.RULE_WIGHT)
                    .build();
        }

        // 否则过滤其他责任链
        log.info("【抽奖责任链-RuleWeightLogicChain】-权重放行 userId: {} strategyId: {} ruleModel: {}", userId, strategyId, Constants.RuleModel.RULE_WIGHT);
        return null;
    }

    private Map<Long, String> getAnalyticalValue(String ruleValue) {
        String[] ruleValueGroups = ruleValue.split(Constants.SPACE);
        Map<Long, String> ruleValueMap = new HashMap<>();
        for (String ruleValueKey : ruleValueGroups) {
            // 检查输入是否为空
            if (ruleValueKey == null || ruleValueKey.isEmpty()) {
                return ruleValueMap;
            }
            // 分割字符串以获取键和值
            String[] parts = ruleValueKey.split(Constants.COLON);
            if (parts.length != 2) {
                log.error("[RuleWeightLogicChain] rule_weight invalid input format {}", ruleValueKey);
                throw new IllegalArgumentException("rule_weight invalid input format " + ruleValueKey);
            }
            ruleValueMap.put(Long.parseLong(parts[0]), ruleValueKey);
        }
        return ruleValueMap;
    }
}
