package com.yuhui.marketing.raffle.repository;

import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;

import java.util.List;

/** Narrow port for RaffleStock; no catalog or unrelated storage dependencies. */
public interface RaffleStock {
    Boolean reduceAwardStock(String key, Long activityId);
    void awardStockConsumeSendQueue(LotteryReqEntity lotteryReqEntity);
    LotteryReqEntity takeQueueValue(String activityAward);
    void updateActivityAwardStock(Long activityId, Long awardId);
    void cacheStrategyAwardCount(String key, Integer awardCount);
    List<String> getActivityAwardList();
    void clearAwardStock(String activityAward);
    void clearQueueValue(String activityAward);
}
