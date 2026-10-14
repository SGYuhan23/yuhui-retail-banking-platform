package com.yuhui.trigger.job;

import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.marketing.raffle.service.Stock;
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

 * 定时任务-更新数据库奖品库存
 */
@Slf4j
@Component
public class UpdateAwardStockJob {

    @Resource
    private Stock stock;

    @Resource
    private ThreadPoolExecutor executor;

    @Resource
    private RedissonClient redissonClient;

    @XxlJob("updateAwardStockJob")
    @Timed(value = "updateAwardStockJob", description = "更新奖品库存任务")
    public void exec() {
        // 为什么加锁？分布式应用N台机器部署互备，任务调度会有N个同时执行，那么这里需要增加抢占机制，谁抢占到谁就执行。完毕后，下一轮继续抢占。
        RLock lock = redissonClient.getLock("lottery-updateAwardStockJob");
        boolean isLocked = false;

        try {
            isLocked = lock.tryLock(3, 0, TimeUnit.SECONDS);
            if (!isLocked) {
                return;
            }

            List<String> awardList = stock.getActivityAwardList();
            for (String activityAward : awardList) {
                executor.execute(() -> {
                    LotteryReqEntity lotteryReqEntity;
                    try {
                        lotteryReqEntity = stock.takeQueueValue(activityAward);
                    } catch (Exception e) {
                        log.error("update award stock job failed while polling queue", e);
                        return;
                    }

                    if (lotteryReqEntity == null) {
                        return;
                    }
                    stock.updateActivityAwardStock(lotteryReqEntity.getActivityId(), lotteryReqEntity.getAwardId());
                    log.info("【定时任务】-更新数据库奖品库存-成功 strategyId:{} awardId:{}", lotteryReqEntity.getActivityId(), lotteryReqEntity.getAwardId());
                });
            }
        } catch (Exception e) {
            log.error("【定时任务】-更新数据库奖品库存-失败", e);
        } finally {
            if (isLocked) {
                lock.unlock();
            }
        }
    }
}
