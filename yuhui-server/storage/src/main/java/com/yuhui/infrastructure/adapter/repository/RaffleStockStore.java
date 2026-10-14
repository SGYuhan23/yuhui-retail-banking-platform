package com.yuhui.infrastructure.adapter.repository;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.yuhui.marketing.participation.event.AwardStockZeroMessageEvent;
import com.yuhui.marketing.participation.model.entity.ActivityEntity;
import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.event.EventPublisher;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBlockingQueue;
import org.redisson.api.RDelayedQueue;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.yuhui.marketing.raffle.repository.RaffleStock;
@Repository @Slf4j
public class RaffleStockStore implements RaffleStock {
    @Resource private StrategyAwardMapper strategyAwardMapper;
    @Resource private RedisService redisService;
    @Resource private ActivityMapper activityMapper;
    @Resource private EventPublisher eventPublisher;
    @Resource private AwardStockZeroMessageEvent awardStockZeroMessageEvent;
    @Override
    public Boolean reduceAwardStock(String key, Long activityId) {
        long count = redisService.decr(key);
        if (count == 0) {
            String[] split = key.split(Constants.UNDERLINE);
            String activityAward = split[split.length - 2] + Constants.UNDERLINE + split[split.length - 1];
            eventPublisher.publish(
                    awardStockZeroMessageEvent.topic(),
                    awardStockZeroMessageEvent.buildEventMessage(activityAward)
            );
        } else if (count < 0) {
            redisService.setAtomicLong(key, 0);
            return false;
        }

        Activity activity = new Activity();
        String cacheKey = Constants.RedisKey.ACTIVITY_KEY + activityId;
        ActivityEntity activityEntity = redisService.getValue(cacheKey);
        if (activityEntity != null) {
            BeanUtils.copyProperties(activityEntity, activity);
        } else {
            activity = activityMapper.selectOne(new QueryWrapper<Activity>().lambda().eq(Activity::getId, activityId));
        }

        long newCount = count + 1;
        String lockKey = key + Constants.UNDERLINE + newCount;
        long expireMillis = activity.getEndDateTime().getTime() - System.currentTimeMillis() + TimeUnit.DAYS.toMillis(1);
        Boolean lock = redisService.setNx(lockKey, expireMillis, TimeUnit.MILLISECONDS);
        if (!lock) {
            log.warn("activity award stock lock failed {}", lockKey);
        }
        return lock;
    }

    @Override
    public void awardStockConsumeSendQueue(LotteryReqEntity lotteryReqEntity) {
        String cacheKey = Constants.RedisKey.ACTIVITY_AWARD_COUNT_QUEUE_KEY
                + lotteryReqEntity.getActivityId()
                + Constants.UNDERLINE
                + lotteryReqEntity.getAwardId();
        RBlockingQueue<LotteryReqEntity> blockingQueue = redisService.getBlockingQueue(cacheKey);
        RDelayedQueue<LotteryReqEntity> delayedQueue = redisService.getDelayedQueue(blockingQueue);
        delayedQueue.offer(lotteryReqEntity, 3, TimeUnit.SECONDS);
    }

    @Override
    public LotteryReqEntity takeQueueValue(String activityAward) {
        String cacheKey = Constants.RedisKey.ACTIVITY_AWARD_COUNT_QUEUE_KEY + activityAward;
        RBlockingQueue<LotteryReqEntity> destinationQueue = redisService.getBlockingQueue(cacheKey);
        return destinationQueue.poll();
    }

    @Override
    public void updateActivityAwardStock(Long activityId, Long awardId) {
        StrategyAward strategyAward = new StrategyAward();
        strategyAward.setActivityId(activityId);
        strategyAward.setAwardId(awardId);
        LambdaUpdateWrapper<StrategyAward> queryWrapper = new UpdateWrapper<StrategyAward>().lambda()
                .setSql("award_count_surplus = award_count_surplus - 1")
                .eq(StrategyAward::getActivityId, activityId)
                .eq(StrategyAward::getAwardId, awardId)
                .gt(StrategyAward::getAwardCountSurplus, 0);
        strategyAwardMapper.update(strategyAward, queryWrapper);
    }

    @Override
    public void cacheStrategyAwardCount(String key, Integer awardCount) {
        redisService.initializeStockIfAbsent(key, awardCount);
    }

    @Override
    public List<String> getActivityAwardList() {
        String cacheKey = Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY + "all";
        List<String> resultValue = redisService.getValue(cacheKey);
        if (resultValue != null && !resultValue.isEmpty()) {
            return resultValue;
        }
        List<StrategyAward> strategyAwards = strategyAwardMapper.selectList(null);
        resultValue = strategyAwards.stream()
                .map(strategyAward -> strategyAward.getActivityId() + Constants.UNDERLINE + strategyAward.getAwardId())
                .collect(Collectors.toList());
        redisService.setValue(cacheKey, resultValue);
        return resultValue;
    }

    @Override
    public void clearAwardStock(String activityAward) {
        String[] split = activityAward.split(Constants.UNDERLINE);
        LambdaUpdateWrapper<StrategyAward> updateWrapper = new LambdaUpdateWrapper<StrategyAward>()
                .set(StrategyAward::getAwardCountSurplus, 0)
                .set(StrategyAward::getUpdateTime, new Date())
                .eq(StrategyAward::getActivityId, Long.parseLong(split[0]))
                .eq(StrategyAward::getAwardId, Long.parseLong(split[1]));
        strategyAwardMapper.update(null, updateWrapper);
    }

    @Override
    public void clearQueueValue(String activityAward) {
        String cacheKey = Constants.RedisKey.ACTIVITY_AWARD_COUNT_QUEUE_KEY + activityAward;
        RBlockingQueue<LotteryReqEntity> blockingQueue = redisService.getBlockingQueue(cacheKey);
        blockingQueue.clear();
        RDelayedQueue<LotteryReqEntity> delayedQueue = redisService.getDelayedQueue(blockingQueue);
        delayedQueue.clear();
    }
}
