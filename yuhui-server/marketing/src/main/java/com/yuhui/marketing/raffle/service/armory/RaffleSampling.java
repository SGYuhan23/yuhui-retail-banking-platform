package com.yuhui.marketing.raffle.service.armory;

import com.yuhui.types.common.Constants;

import javax.annotation.Resource;

@org.springframework.stereotype.Service
public class RaffleSampling implements StrategyService {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleStock stock;

    private final RaffleAlgorithms algorithms;
    public RaffleSampling(RaffleAlgorithms algorithms) {
        this.algorithms=algorithms;
    }
    @Override
    public Long getRandomAwardId(Long activityId) {
        return algorithms.draw(String.valueOf(activityId));
    }

    @Override
    public Long getRandomAwardId(Long activityId, String ruleWeightValue) {
        String newRuleWeightValue = ruleWeightValue.split(Constants.COLON)[0];
        String key = activityId + Constants.UNDERLINE + newRuleWeightValue;
        return algorithms.draw(key);
    }

    @Override
    public Boolean reduceAwardStock(Long activityId, Long awardId) {
        String key = Constants.RedisKey.ACTIVITY_AWARD_COUNT_KEY + activityId + Constants.UNDERLINE + awardId;
        return stock.reduceAwardStock(key, activityId);
    }
}
