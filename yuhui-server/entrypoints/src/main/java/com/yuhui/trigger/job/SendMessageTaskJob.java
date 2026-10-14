package com.yuhui.trigger.job;
import cn.bugstack.middleware.db.router.strategy.IDBRouterStrategy;
import com.yuhui.marketing.task.service.TaskService;
import com.xxl.job.core.handler.annotation.XxlJob;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;
import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

/** Bounded outbox batch. Watchdog lock spans the entire batch, including confirms and DB updates. */
@Slf4j @Component
public class SendMessageTaskJob {
    @Resource private TaskService taskService;
    @Resource private IDBRouterStrategy dbRouter;
    @Resource private RedissonClient redissonClient;
    @XxlJob("SendMessageTaskJob")
    public void exec() {
        RLock lock=redissonClient.getLock("lottery-SendMessageTaskJob");
        boolean acquired=false;
        try {
            acquired=lock.tryLock(0,TimeUnit.SECONDS);
            if(!acquired) return;
            for(int db=1;db<=dbRouter.dbCount();db++) {
                dbRouter.setDBKey(db);
                taskService.dispatchPendingBatch();
                dbRouter.clear();
            }
        } catch(InterruptedException e) { Thread.currentThread().interrupt(); }
        catch(Exception e) { log.error("Outbox scan failed",e); }
        finally { dbRouter.clear(); if(acquired && lock.isHeldByCurrentThread()) lock.unlock(); }
    }
}
