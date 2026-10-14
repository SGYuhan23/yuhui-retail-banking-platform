package com.yuhui.marketing.raffle.service.armory.algorithm;

import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;

import java.math.BigDecimal;
import java.util.List;

/**

 * 装配/抽奖算法接口
 */
public interface Algorithm {

    void armoryAlgorithm(String key, List<StrategyAwardEntity> strategyAwardEntities, BigDecimal rateRange);

    Long dispatchAlgorithm(String key);
}
