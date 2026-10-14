package com.yuhui.infrastructure.adapter.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.yuhui.marketing.participation.event.ActivitySkuStockZeroMessageEvent;
import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.model.valobj.ActivitySkuStockKeyVO;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.event.EventPublisher;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBlockingQueue;
import org.redisson.api.RDelayedQueue;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.yuhui.marketing.participation.repository.ParticipationInventory;
@Repository @Slf4j
public class ParticipationInventoryStore implements ParticipationInventory {
    @Resource private RedisService redisService;
    @Resource private ActivitySkuMapper activitySkuMapper;
    @Resource private EventPublisher eventPublisher;
    @Resource private ActivitySkuStockZeroMessageEvent activitySkuStockZeroMessageEvent;
    @Override
    public void cacheActivitySkuStockCount(String key, Integer stockCountSurplus) {
        redisService.initializeStockIfAbsent(key, stockCountSurplus);
    }

    @Override
    public boolean reduceActivitySkuStock(Long sku, String key, Date endDateTime) {
        //判断该key是否存在
        if (!redisService.isExists(key)) {
            LambdaQueryWrapper<ActivitySku> queryWrapper = new LambdaQueryWrapper<ActivitySku>().eq(ActivitySku::getId, sku);
            ActivitySku activitySku = activitySkuMapper.selectOne(queryWrapper);
            cacheActivitySkuStockCount(key, activitySku.getStockCountSurplus());
        }
        long count = redisService.decr(key);
        if (count == 0) {
            // 库存消耗没了以后，发送MQ消息，更新数据库库存
            log.debug("[ActivityRepositoryImpl]已无库存，发送MQ消息清空数据库库存 sku: {}", sku);
            eventPublisher.publish(activitySkuStockZeroMessageEvent.topic(), activitySkuStockZeroMessageEvent.buildEventMessage(sku));
        } else if (count < 0) {
            redisService.setAtomicLong(key, 0);
            throw new AppException(ResponseCode.ACTIVITY_SKU_STOCK_ERROR.getCode(), ResponseCode.ACTIVITY_SKU_STOCK_ERROR.getMessage());
        }
        long newCount = count + 1;
        String lockKey = key + Constants.UNDERLINE + newCount;
        //过期时间为活动结束后一天
        long expireMillis = endDateTime.getTime() - System.currentTimeMillis() + TimeUnit.DAYS.toMillis(1);
        Boolean lock = redisService.setNx(lockKey, expireMillis, TimeUnit.MILLISECONDS);
        log.debug("[ActivityRepositoryImpl]额度库存加锁成功 {}", lockKey);
        if (!lock) {
            log.error("[ActivityRepositoryImpl]额度库存加锁失败 {}", lockKey);
        }
        return lock;
    }

    @Override
    public void activitySkuStockConsumeSendQueue(ActivitySkuStockKeyVO activitySkuStockKeyVO) {
        String cacheKey = Constants.RedisKey.ACTIVITY_SKU_COUNT_QUEUE_KEY + activitySkuStockKeyVO.getSku();
        // 阻塞队列
        RBlockingQueue<ActivitySkuStockKeyVO> blockingQueue = redisService.getBlockingQueue(cacheKey);
        // 延迟队列
        RDelayedQueue<ActivitySkuStockKeyVO> delayedQueue = redisService.getDelayedQueue(blockingQueue);
        delayedQueue.offer(activitySkuStockKeyVO, 3, TimeUnit.SECONDS);
        log.debug("[ActivityRepositoryImpl]延迟队列创建成功 sku: {}", activitySkuStockKeyVO.getSku());
    }

    @Override
    public ActivitySkuStockKeyVO takeQueueValue(Long sku) {
        String cacheKey = Constants.RedisKey.ACTIVITY_SKU_COUNT_QUEUE_KEY + sku;
        RBlockingQueue<ActivitySkuStockKeyVO> destinationQueue = redisService.getBlockingQueue(cacheKey);
        log.debug("[ActivityRepositoryImpl]从阻塞队列中取出值 sku: {}", sku);
        return destinationQueue.poll();
    }

    @Override
    public void updateActivitySkuStock(Long sku) {
        LambdaUpdateWrapper<ActivitySku> queryWrapper = new LambdaUpdateWrapper<ActivitySku>()
                .setSql("stock_count_surplus = stock_count_surplus - 1")
                .set(ActivitySku::getUpdateTime, new Date())
                .eq(ActivitySku::getId, sku)
                .gt(ActivitySku::getStockCountSurplus, 0);
        activitySkuMapper.update(null, queryWrapper);
        log.debug("[ActivityRepositoryImpl]更新活动sku库存成功 sku: {}", sku);
    }

    @Override
    public void clearQueueValue(Long sku) {
        String cacheKey = Constants.RedisKey.ACTIVITY_SKU_COUNT_QUEUE_KEY + sku;
        RBlockingQueue<ActivitySkuStockKeyVO> blockingQueue = redisService.getBlockingQueue(cacheKey);
        blockingQueue.clear();
        RDelayedQueue<ActivitySkuStockKeyVO> delayedQueue = redisService.getDelayedQueue(blockingQueue);
        delayedQueue.clear();
        log.debug("[ActivityRepositoryImpl]清空sku库存为0的阻塞队列与延时队列成功 sku: {}", sku);
    }

    @Override
    public void clearActivitySkuStock(Long sku) {
        LambdaUpdateWrapper<ActivitySku> queryWrapper = new LambdaUpdateWrapper<ActivitySku>()
                .set(ActivitySku::getStockCountSurplus, 0)
                .set(ActivitySku::getUpdateTime, new Date())
                .eq(ActivitySku::getId, sku);
        activitySkuMapper.update(null, queryWrapper);
        log.debug("[ActivityRepositoryImpl]清空活动sku库存成功 sku: {}", sku);
    }

    @Override
    public List<Long> querySkuList() {
        String cacheKey = Constants.RedisKey.ACTIVITY_SKU_LIST_KEY;
        List<Long> resultValue = redisService.getValue(cacheKey);
        if (resultValue != null && !resultValue.isEmpty()) {
            return resultValue;
        }
        //查sku数据库全部列表的id
        List<ActivitySku> activitySkus = activitySkuMapper.selectList(null);
        resultValue = activitySkus.stream().map(ActivitySku::getId).collect(Collectors.toList());
        redisService.setValue(cacheKey, resultValue);
        return resultValue;
    }
}
