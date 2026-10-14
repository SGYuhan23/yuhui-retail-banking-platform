package com.yuhui.marketing.raffle.service.rule.chain.impl;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.service.rule.chain.LogicChain;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;

/**

 * 抽奖前-黑名单责任链
 */
@Slf4j
@Component(Constants.RuleModel.RULE_BLACKLIST)
public class RuleBackListLogicChain implements LogicChain {

    @Resource
    private StrategyRepository repository;

    @Override
    public RuleEntity logic(String userId, Long strategyId,Long activityId) {
        log.info("【抽奖责任链-RuleBackListLogicChain】-黑名单开始 userId: {} strategyId: {} ruleModel: {}", userId, strategyId, Constants.RuleModel.RULE_BLACKLIST);
        // 1. 查询配置的值
        String strategyRuleValue = repository.queryStrategyRuleValue(strategyId, Constants.RuleModel.RULE_BLACKLIST);
        String[] splitRuleValue = strategyRuleValue.split(Constants.COLON);
        Long awardId = Long.valueOf(splitRuleValue[0]);

        // 2. 查询该值对应的黑名单用户
        String[] userBlackIds = splitRuleValue[1].split(Constants.SPLIT);

        // 如果用户在黑名单中，进行接管
        for (String userBlackId : userBlackIds) {
            if (userId.equals(userBlackId)) {
                log.info("【抽奖责任链-RuleBackListLogicChain】-黑名单接管 userId: {} strategyId: {} ruleModel: {} awardId: {}", userId, strategyId, Constants.RuleModel.RULE_BLACKLIST, awardId);
                //根据awardId查配置的黑名单的值
                String ruleValue = repository.queryRuleValue(awardId);
                return RuleEntity.builder()
                        .awardId(awardId)
                        .ruleValue(ruleValue)
                        .ruleModel(Constants.RuleModel.RULE_BLACKLIST)
                        .build();
            }
        }
        // 否则过滤其他责任链
        log.info("【抽奖责任链-RuleBackListLogicChain】-黑名单放行 userId: {} strategyId: {} ruleModel: {}", userId, strategyId, Constants.RuleModel.RULE_BLACKLIST);
        return null;
    }
}
