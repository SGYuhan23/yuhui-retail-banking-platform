package com.yuhui.marketing.raffle.service.armory.algorithm.impl;

import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.service.armory.algorithm.AbstractAlgorithm;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

/**

 * 奖品1:0.7 奖品2:0.3 -> (1 2 3 4 5 6 7)-奖品1 (8 9 10)-奖品2
 */
@Slf4j
@Component(Constants.Algorithm.O1)
public class O1Algorithm extends AbstractAlgorithm {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleProbabilityIndex probabilityIndex;

    @Override
    public void armoryAlgorithm(String key, List<StrategyAwardEntity> strategyAwardEntities, BigDecimal rateRange) {
        log.debug("[O1Algorithm] 策略算法 O(1) 装配 key:{}", key);
        // 生成策略奖品概率查找表（在list集合中，存放上对应的奖品占位即可，占位越多等于概率越高）
        // 不用频繁扩容，提高性能
        List<Long> strategyAwardSearchRateTables = new ArrayList<>(rateRange.intValue());
        for (StrategyAwardEntity strategyAward : strategyAwardEntities) {
            Long awardId = strategyAward.getAwardId();
            BigDecimal awardRate = strategyAward.getAwardRate();
            // 计算出每个概率值需要存放到查找表的数量，循环填充
            for (int i = 0; i < rateRange.multiply(awardRate).intValue(); i++) {
                strategyAwardSearchRateTables.add(awardId);
            }
        }

        // 4. 进行乱序操作
        Collections.shuffle(strategyAwardSearchRateTables);

        // 5. 构造Map集合（比如抽到的数是31，就查找31对应的奖品）
        Map<Integer, Long> shuffleStrategyAwardSearchRateTable = new LinkedHashMap<>();
        for (int i = 0; i < strategyAwardSearchRateTables.size(); i++) {
            shuffleStrategyAwardSearchRateTable.put(i, strategyAwardSearchRateTables.get(i));
        }

        // 6. 存放到 Redis
        probabilityIndex.storeStrategyAwardSearchRateTable(key, shuffleStrategyAwardSearchRateTable.size(), shuffleStrategyAwardSearchRateTable);

    }

    @Override
    public Long dispatchAlgorithm(String key) {
        log.debug("[O1Algorithm] 抽奖算法 O(1) 计算 key:{}", key);
        int rateRange = probabilityIndex.getRateRange(key);
        // 通过生成的随机值，获取概率值奖品查找表的结果
        return probabilityIndex.getStrategyAwardAssemble(key, secureRandom.nextInt(rateRange));
    }
}
