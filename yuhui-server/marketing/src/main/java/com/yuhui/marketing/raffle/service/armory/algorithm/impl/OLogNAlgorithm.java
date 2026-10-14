package com.yuhui.marketing.raffle.service.armory.algorithm.impl;

import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.service.armory.algorithm.AbstractAlgorithm;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ThreadPoolExecutor;

/**

 * 奖品1:0.7 奖品2:0.3 -> (1-7)-奖品1 (8-10)-奖品2
 */
@Slf4j
@Component(Constants.Algorithm.OLogN)
public class OLogNAlgorithm extends AbstractAlgorithm {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleProbabilityIndex probabilityIndex;

    @Resource
    private ThreadPoolExecutor threadPoolExecutor;

    /**
     * 预热活动概率值
     * 如概率值为；3、4、2、9，存储为 [1~3]、[4~7]、[8~9]、[10~18]，抽奖时，for循环匹配。
     *
     * @param key                   为策略ID、权重ID
     * @param strategyAwardEntities 对应的奖品概率
     */
    @Override
    public void armoryAlgorithm(String key, List<StrategyAwardEntity> strategyAwardEntities, BigDecimal rateRange) {
        log.debug("[OLogNAlgorithm] 策略算法 OLog(n) 装配 key:{}", key);
        int from = 1;
        int to = 0;

        Map<String, Long> table = new HashMap<>();
        for (StrategyAwardEntity strategyAward : strategyAwardEntities) {
            Long awardId = strategyAward.getAwardId();
            BigDecimal awardRate = strategyAward.getAwardRate();
            to += rateRange.multiply(awardRate).intValue();
            String k = from + Constants.UNDERLINE + to;
            table.put(k, awardId);
            from = to + 1;
        }

        probabilityIndex.storeStrategyAwardSearchRateTable(key, to, table);
    }

    @Override
    public Long dispatchAlgorithm(String key) {
        int rateRange = probabilityIndex.getRateRange(key);
        Map<String, Long> table = probabilityIndex.getMap(key);
        // 小于等于8 for循环、小于等于16 二分查找、更多检索走多线程
        if (table.size() <= 8) {
            log.debug("[OLogNAlgorithm] 抽奖算法 OLog(n) 抽奖计算（循环） key:{}", key);
            return forSearch(secureRandom.nextInt(rateRange), table);
        } else if (table.size() <= 16) {
            log.debug("[OLogNAlgorithm] 抽奖算法 OLog(n) 抽奖计算（二分） key:{}", key);
            return binarySearch(secureRandom.nextInt(rateRange), table);
        } else {
            log.debug("[OLogNAlgorithm] 抽奖算法 OLog(n) 抽奖计算（多线程） key:{}", key);
            return threadSearch(secureRandom.nextInt(rateRange), table);
        }
    }

    private Long forSearch(int rateKey, Map<String, Long> table) {
        Long awardId = null;
        for (Map.Entry<String, Long> entry : table.entrySet()) {
            String key = entry.getKey();
            // 分解 form to
            String[] split = key.split(Constants.UNDERLINE);
            int from = Integer.parseInt(split[0]);
            int to = Integer.parseInt(split[1]);
            if (rateKey >= from && rateKey <= to) {
                awardId = entry.getValue();
                break;
            }
        }
        return awardId;
    }

    private Long binarySearch(int rateKey, Map<String, Long> table) {
        // 将所有 键值 对放入List集合
        List<Map.Entry<String, Long>> entries = new ArrayList<>(table.entrySet());
        // 排序
        entries.sort(Comparator.comparingInt(e -> Integer.parseInt(e.getKey().split(Constants.UNDERLINE)[0])));

        int left = 0;
        int right = entries.size() - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            Map.Entry<String, Long> entry = entries.get(mid);
            String[] split = entry.getKey().split(Constants.UNDERLINE);
            int from = Integer.parseInt(split[0]);
            int to = Integer.parseInt(split[1]);
            if (rateKey < from) {
                right = mid - 1;
            } else if (rateKey > to) {
                left = mid + 1;
            } else {
                return entry.getValue();
            }
        }
        return null;
    }

    private Long threadSearch(int rateKey, Map<String, Long> table) {
        List<CompletableFuture<Map.Entry<String, Long>>> futures = table.entrySet().stream()
                .map(entry -> CompletableFuture.supplyAsync(() -> {
                    String[] split = entry.getKey().split(Constants.UNDERLINE);
                    int from = Integer.parseInt(split[0]);
                    int to = Integer.parseInt(split[1]);
                    if (rateKey >= from && rateKey <= to) {
                        return entry;
                    }
                    return null;
                }, threadPoolExecutor))
                .toList();

        CompletableFuture<Void> allFutures = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));

        try {
            // 等待所有异步任务完成，同时返回第一个匹配的结果
            allFutures.join();
            for (CompletableFuture<Map.Entry<String, Long>> future : futures) {
                Map.Entry<String, Long> result = future.getNow(null);
                if (result != null) {
                    return result.getValue();
                }
            }
        } catch (CompletionException e) {
            e.printStackTrace();
        }
        return null;
    }

}
