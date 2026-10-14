package com.yuhui.marketing.application;
import com.yuhui.marketing.participation.model.entity.PartakeOrderResEntity;
import com.yuhui.marketing.participation.service.ActivityPartakeService;
import com.yuhui.marketing.raffle.model.entity.*;
import com.yuhui.marketing.raffle.service.Lottery;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;
import com.yuhui.marketing.reward.fulfillment.model.valobj.AwardStateVO;
import com.yuhui.marketing.reward.fulfillment.service.UserAwardService;
import org.springframework.stereotype.Service;
/** Preserves the existing order -> selection -> durable award sequence, without a new distributed transaction. */
@Service
public class DrawParticipation {
    private final ActivityPartakeService activityPartakeService;
    private final Lottery lottery;
    private final UserAwardService userAwardService;
    public DrawParticipation(ActivityPartakeService participation, Lottery lottery, UserAwardService awards) {
        this.activityPartakeService=participation;this.lottery=lottery;this.userAwardService=awards;
    }
    public LotteryResEntity draw(String userId,Long activityId) {
        PartakeOrderResEntity partakeOrder = activityPartakeService.createPartakeOrder(userId, activityId);
        LotteryResEntity lotteryResEntity = lottery.doLottery(LotteryReqEntity.builder().userId(partakeOrder.getUserId()).strategyId(partakeOrder.getStrategyId()).activityId(partakeOrder.getActivityId()).build());
        UserAwardRecordEntity userAwardRecord = UserAwardRecordEntity.builder()
                .userId(partakeOrder.getUserId())
                .activityId(partakeOrder.getActivityId())
                .strategyId(partakeOrder.getStrategyId())
                .userOrderId(partakeOrder.getId())
                .awardConfig(lotteryResEntity.getAwardConfig())
                .awardId(lotteryResEntity.getAwardId())
                .awardTitle(lotteryResEntity.getAwardTitle())
                .awardTime(lotteryResEntity.getAwardTime())
                .awardState(AwardStateVO.create)
                .build();
        userAwardService.saveUserAwardRecord(userAwardRecord);
        return lotteryResEntity;
    }
}
