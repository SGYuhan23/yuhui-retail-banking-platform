package com.yuhui.marketing.raffle.service.armory;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyEntity;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@org.springframework.stereotype.Service
public class RafflePreparation implements StrategyArmory {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleRuleTrees ruleTrees;

    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleStock stock;

    private final StrategyRepository repository;
    private final RaffleAlgorithms algorithms;
    public RafflePreparation(StrategyRepository repository, RaffleAlgorithms algorithms) {
        this.repository=repository; this.algorithms=algorithms;
    }
    @Override
    public boolean assembleLotteryStrategy(Long strategyId) {
        List<Long> activityIds = repository.queryActivityIdsByStrategyId(strategyId);
        if (activityIds == null || activityIds.isEmpty()) {
            return true;
        }
        for (Long activityId : activityIds) {
            assembleLotteryStrategyByActivityId(activityId);
        }
        return true;
    }

    @Override
    public boolean assembleLotteryStrategyByActivityId(Long activityId) {
        repository.deleteCacheKeyByActivityId(activityId);
        Long strategyId = repository.queryStrategyIdByActivityId(activityId);
        if (strategyId == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), "activity strategy is not configured");
        }

        List<StrategyAwardEntity> strategyAwardEntities = repository.queryActivityAwardList(activityId);
        if (strategyAwardEntities == null || strategyAwardEntities.isEmpty()) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), "activity award is not configured");
        }

        List<Long> treeIds = strategyAwardEntities.stream()
                .map(StrategyAwardEntity::getRuleTreeId)
                .filter(treeId -> treeId != null && treeId > 0)
                .distinct()
                .toList();
        for (Long treeId : treeIds) {
            ruleTrees.deleteCacheKeyByTreeId(treeId);
            ruleTrees.queryRuleTreeVO(treeId);
        }

        for (StrategyAwardEntity strategyAwardEntity : strategyAwardEntities) {
            Long awardId = strategyAwardEntity.getAwardId();
            Integer awardCount = strategyAwardEntity.getAwardCountSurplus();
            cacheActivityAwardCount(activityId, awardId, awardCount);
            repository.queryActivityAwardEntity(activityId, awardId);
        }

        algorithms.prepare(String.valueOf(activityId), strategyAwardEntities);

        StrategyEntity strategyEntity = repository.queryStrategyEntityByStrategyId(strategyId);
        if (strategyEntity.getRuleModels() == null || strategyEntity.getRuleWeight() == null) {
            return true;
        }

        RuleEntity ruleEntity = repository.queryStrategyRule(strategyEntity.getRuleWeight());
        if (ruleEntity == null) {
            throw new AppException(
                    ResponseCode.STRATEGY_RULE_WEIGHT_IS_NULL.getCode(),
                    ResponseCode.STRATEGY_RULE_WEIGHT_IS_NULL.getMessage()
            );
        }

        Map<String, List<Long>> ruleWeightValuesMap = ruleEntity.getRuleWeightValues();
        Set<String> keys = ruleWeightValuesMap.keySet();
        for (String key : keys) {
            List<Long> ruleWeightValues = ruleWeightValuesMap.get(key);
            ArrayList<StrategyAwardEntity> strategyAwardEntitiesClone = new ArrayList<>(strategyAwardEntities);
            strategyAwardEntitiesClone.removeIf(entity -> !ruleWeightValues.contains(entity.getAwardId()));
            String newKey = key.split(Constants.COLON)[0];
            algorithms.prepare(activityId + Constants.UNDERLINE + newKey, strategyAwardEntitiesClone);
        }
        return true;
    }

    protected void cacheActivityAwardCount(Long activityId, Long awardId, Integer awardCount) {
        String key = Constants.RedisKey.ACTIVITY_AWARD_COUNT_KEY + activityId + Constants.UNDERLINE + awardId;
        stock.cacheStrategyAwardCount(key, awardCount);
    }

}
