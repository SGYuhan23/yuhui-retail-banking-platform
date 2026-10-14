package com.yuhui.marketing.raffle.service;

import com.yuhui.marketing.raffle.event.SendLotteryMessageEvent;
import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.marketing.raffle.model.entity.LotteryResEntity;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.event.BaseEvent;
import com.yuhui.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;

import java.util.Date;

@org.springframework.stereotype.Service
@Slf4j
public class RaffleExecution implements Lottery {
    private final StrategyRepository repository;
    private final RaffleRuleSelection rules;
    private final SendLotteryMessageEvent sendLotteryMessageEvent;
    public RaffleExecution(StrategyRepository repository, RaffleRuleSelection rules, SendLotteryMessageEvent event) {
        this.repository = repository; this.rules = rules; this.sendLotteryMessageEvent = event;
    }
    @Override
    public LotteryResEntity doLottery(LotteryReqEntity lotteryReqEntity) {
        String userId = lotteryReqEntity.getUserId();
        Long strategyId = lotteryReqEntity.getStrategyId();
        Long activityId = lotteryReqEntity.getActivityId();
        if (strategyId == null || activityId == null) {
            log.error("[RaffleExecution]抽奖失败,strategyId/activityId为 null 用户ID：{}", userId);
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleEntity chainAward = rules.select(userId, strategyId, activityId);
        log.debug("[RaffleExecution]抽奖责任链通过 用户ID：{}, 策略ID：{}, 奖品ID：{}, 奖品规则模型：{}", userId, strategyId, chainAward.getAwardId(), chainAward.getRuleModel());
        if (!Constants.RuleModel.DEFAULT.equals(chainAward.getRuleModel())) {
            return buildLotteryAwardEntity(activityId, chainAward.getAwardId());
        }
        RuleEntity treeAward = rules.resolve(userId, strategyId, activityId, chainAward.getAwardId());
        log.debug("[RaffleExecution]默认规则执行规则树 用户ID：{}, 策略ID：{}, 奖品ID：{}, 奖品规则模型：{}", userId, strategyId, treeAward.getAwardId(), treeAward.getRuleValue());
        LotteryResEntity resEntity = buildLotteryAwardEntity(activityId, treeAward.getAwardId());

        SendLotteryMessageEvent.LotteryMessage message = SendLotteryMessageEvent.LotteryMessage.builder()
                .userId(userId)
                .awardConfig(resEntity.getAwardConfig())
                .awardTitle(resEntity.getAwardTitle())
                .awardId(resEntity.getAwardId())
                .activityId(String.valueOf(activityId))
                .sort(resEntity.getSort())
                .awardTime(resEntity.getAwardTime())
                .build();
        BaseEvent.EventMessage<SendLotteryMessageEvent.LotteryMessage> lotteryMessageEventMessage =
                sendLotteryMessageEvent.buildEventMessage(message);
        repository.sendLotteryMessageToMq(sendLotteryMessageEvent.topic(), lotteryMessageEventMessage);

        return resEntity;

    }

    private LotteryResEntity buildLotteryAwardEntity(Long activityId, Long awardId) {
        StrategyAwardEntity strategyAward = repository.queryActivityAwardEntity(activityId, awardId);
        return LotteryResEntity.builder()
                .awardId(awardId)
                .awardTitle(strategyAward.getAwardTitle())
                .awardConfig(strategyAward.getAwardConfig())
                .sort(strategyAward.getSort())
                .awardTime(new Date())
                .build();
    }

    @Override
    public java.util.List<StrategyAwardEntity> queryLotteryAwardListByActivityId(Long activityId) {
        return repository.queryActivityAwardList(activityId);
    }

}
