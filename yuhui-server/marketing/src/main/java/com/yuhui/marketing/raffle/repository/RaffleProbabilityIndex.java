package com.yuhui.marketing.raffle.repository;


import java.util.Map;

/** Narrow port for RaffleProbabilityIndex; no catalog or unrelated storage dependencies. */
public interface RaffleProbabilityIndex {
    void publishAliasTable(String key, Map<Integer,String> rows);
    String aliasSnapshot(String key);
    String aliasRow(String snapshot, int column);
    <K, V> void storeStrategyAwardSearchRateTable(String key, Integer rateRange, Map<K, V> strategyAwardSearchRateTable);
    Long getStrategyAwardAssemble(String strategyId, Integer rateKey);
    int getRateRange(String strategyId);
    void cacheStrategyArmoryAlgorithm(String key, String name);
    String queryStrategyArmoryAlgorithmFromCache(String key);
    <K, V> Map<K, V> getMap(String key);
}
