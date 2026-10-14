package com.yuhui.marketing.raffle.service;

import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;

import java.util.List;

/**

 * 策略-抽奖领域-库存相关操作
 */
public interface Stock {

    LotteryReqEntity takeQueueValue(String activityAward);

    void updateActivityAwardStock(Long activityId, Long awardId);

    List<String> getActivityAwardList();

    void clearAwardStock(String activityAward);

    void clearQueueValue(String activityAward);
}
