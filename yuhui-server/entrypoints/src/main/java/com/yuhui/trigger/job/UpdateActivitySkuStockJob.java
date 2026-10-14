package com.yuhui.trigger.job;

import com.yuhui.marketing.participation.model.valobj.ActivitySkuStockKeyVO;
import com.yuhui.marketing.participation.service.ActivitySkuStockService;
import com.xxl.job.core.handler.annotation.XxlJob;
import io.micrometer.core.annotation.Timed;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**

 * 定时任务-更新数据库suk库存
 */
@Slf4j
@Component
public class UpdateActivitySkuStockJob {
    @Resource
    private ActivitySkuStockService skuStock;
    @Resource
    private ThreadPoolExecutor executor;
    @Resource
    private RedissonClient redissonClient;

    @XxlJob("UpdateActivitySkuStockJob")
    @Timed(value = "updateActivitySkuStockJob",description = "更新活动sku库存任务")
    public void exec() {
        // 为什么加锁？分布式应用N台机器部署互备，任务调度会有N个同时执行，那么这里需要增加抢占机制，谁抢占到谁就执行。完毕后，下一轮继续抢占。
        RLock lock = redissonClient.getLock("lottery-UpdateActivitySkuStockJob");
        boolean isLocked = false;

        try {
            isLocked = lock.tryLock(3, 0, TimeUnit.SECONDS);
            if (!isLocked) {
                return;
            }

            List<Long> skuList = skuStock.querySkuList();
            for (Long sku : skuList) {
                executor.execute(() -> {
                    ActivitySkuStockKeyVO activitySkuStockKeyVO = null;
                    try {
                        activitySkuStockKeyVO = skuStock.takeQueueValue(sku);
                    } catch (Exception e) {
                        log.error("【定时任务-UpdateActivitySkuStockJob】-更新活动sku库存-失败", e);
                    }

                    if (activitySkuStockKeyVO == null) {
                        return;
                    }
                    skuStock.updateActivitySkuStock(activitySkuStockKeyVO.getSku());
                    log.info("【定时任务-UpdateActivitySkuStockJob】-更新活动sku库存-成功 sku:{} activityId:{}", activitySkuStockKeyVO.getSku(), activitySkuStockKeyVO.getActivityId());
                });
            }

        } catch (Exception e) {
            log.error("【定时任务-UpdateActivitySkuStockJob】-更新活动sku库存-失败", e);
        } finally {
            if (isLocked) {
                lock.unlock();
            }
        }
    }
}
