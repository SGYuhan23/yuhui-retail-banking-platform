package com.yuhui.config;
import com.yuhui.trigger.job.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import javax.annotation.Resource;
@Component
@Profile("local")
public class LocalJobs {
    @Resource private SendMessageTaskJob messages;
    @Resource private UpdateActivitySkuStockJob skus;
    @Resource private UpdateAwardStockJob awards;
    @Scheduled(fixedDelay=5000, initialDelay=15000) public void messages() { messages.exec(); }
    @Scheduled(fixedDelay=1000, initialDelay=15000) public void inventory() { skus.exec(); awards.exec(); }
}
