package com.yuhui.infrastructure.adapter.repository;

import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.*;

import com.yuhui.marketing.raffle.repository.RaffleProbabilityIndex;
@Repository @Slf4j
public class RaffleProbabilityStore implements RaffleProbabilityIndex {
    @Resource private RedisService redisService;
    @Override
    public <K, V> void storeStrategyAwardSearchRateTable(String key, Integer rateRange, Map<K, V> strategyAwardSearchRateTable) {
        redisService.setValue(Constants.RedisKey.RATE_RANGE_KEY + key, rateRange);
        Map<K, V> cacheRateTable = redisService.getMap(Constants.RedisKey.RATE_TABLE_KEY + key);
        cacheRateTable.putAll(strategyAwardSearchRateTable);
    }

    @Override
    public Long getStrategyAwardAssemble(String strategyId, Integer rateKey) {
        return redisService.getFromMap(Constants.RedisKey.RATE_TABLE_KEY + strategyId, rateKey);
    }

    @Override
    public int getRateRange(String strategyId) {
        Integer rateRange = redisService.getValue(Constants.RedisKey.RATE_RANGE_KEY + strategyId);
        return rateRange == null ? 0 : rateRange;
    }

    @Override
    public void cacheStrategyArmoryAlgorithm(String key, String name) {
        String cacheKey = Constants.RedisKey.ACTIVITY_ALGORITHM_KEY + key;
        if (redisService.isExists(cacheKey)) {
            redisService.remove(cacheKey);
        }
        redisService.setValue(cacheKey, name);
    }

    @Override
    public String queryStrategyArmoryAlgorithmFromCache(String key) {
        String cacheKey = Constants.RedisKey.ACTIVITY_ALGORITHM_KEY + key;
        if (!redisService.isExists(cacheKey)) {
            return null;
        }
        return redisService.getValue(cacheKey);
    }

    @Override
    public <K, V> Map<K, V> getMap(String key) {
        return redisService.getMap(Constants.RedisKey.RATE_TABLE_KEY + key);
    }
    @Override public void publishAliasTable(String key, Map<Integer,String> rows) {
        String pointer="alias:current:"+key;
        String snapshot="alias:table:"+UUID.randomUUID()+":"+rows.size();
        redisService.<Integer,String>getMap(snapshot).putAll(rows);
        // Atomic pointer swap: readers never see a partially populated table.
        org.redisson.api.RLock lock=redisService.getLock("alias:publish:"+key);
        lock.lock();
        try {
            String old=redisService.getValue(pointer);
            redisService.setValue(pointer,snapshot);
            // Retain retired tables for in-flight draws; current table has no TTL.
            if(old!=null) redisService.getMap(old).expire(java.time.Duration.ofHours(1));
        } finally { lock.unlock(); }
    }
    @Override public String aliasSnapshot(String key) { return redisService.getValue("alias:current:"+key); }
    @Override public String aliasRow(String snapshot,int column) { return redisService.getFromMap(snapshot,column); }
}
