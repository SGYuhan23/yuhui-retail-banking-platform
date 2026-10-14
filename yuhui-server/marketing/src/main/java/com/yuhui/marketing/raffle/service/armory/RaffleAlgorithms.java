package com.yuhui.marketing.raffle.service.armory;

import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.service.armory.algorithm.Algorithm;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class RaffleAlgorithms {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleProbabilityIndex probabilityIndex;

    private final Map<String, Algorithm> algorithmMap;
    public RaffleAlgorithms(Map<String, Algorithm> algorithms) {
        this.algorithmMap=algorithms;
    }
    public void prepare(String key, List<StrategyAwardEntity> strategyAwardEntities) {
        algorithmMap.get("alias").armoryAlgorithm(key, strategyAwardEntities, BigDecimal.ONE);
        probabilityIndex.cacheStrategyArmoryAlgorithm(key, "alias");
    }

    public Long draw(String key) {
        String name = probabilityIndex.queryStrategyArmoryAlgorithmFromCache(key);
        if (name == null) {
            throw new RuntimeException("lottery algorithm is not configured");
        }
        Algorithm algorithm = algorithmMap.get(name);
        return algorithm.dispatchAlgorithm(key);
    }
}
