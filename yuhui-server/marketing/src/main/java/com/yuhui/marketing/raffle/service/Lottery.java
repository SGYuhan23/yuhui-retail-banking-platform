package com.yuhui.marketing.raffle.service;

import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.marketing.raffle.model.entity.LotteryResEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;

import java.util.List;

/**

 * 策略-抽奖领域-抽奖相关操作
 */
public interface Lottery {

    List<StrategyAwardEntity> queryLotteryAwardListByActivityId(Long activityId);

    LotteryResEntity doLottery(LotteryReqEntity lotteryFactorEntity);
}
