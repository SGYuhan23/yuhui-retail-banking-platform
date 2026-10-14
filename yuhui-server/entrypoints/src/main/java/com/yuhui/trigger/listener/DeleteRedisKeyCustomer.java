package com.yuhui.trigger.listener;

import com.yuhui.infrastructure.redis.RedisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.concurrent.ThreadPoolExecutor;

/**

 * 发奖
 */
@Slf4j
@Component
public class DeleteRedisKeyCustomer {
    @Value("${spring.rabbitmq.topic.delete_keys_with_prefix}")
    private String topic;

    @Resource
    private RedisService redisService;
    @Resource
    private ThreadPoolExecutor executor;

    @RabbitListener(queuesToDeclare = @Queue(value = "${spring.rabbitmq.topic.delete_keys_with_prefix}"))
    public void listener(String message) {
        try {
            log.info("[DeleteRedisKeyCustomer]监听到删除redis的key消息 topic: {} message: {}", topic, message);
            executor.execute(() -> redisService.deleteKeysWithPrefix(message));
            log.info("[DeleteRedisKeyCustomer]删除redis的key消息，消费成功 topic: {} message: {}", topic, message);
        } catch (Exception e) {
            log.error("[DeleteRedisKeyCustomer]删除redis的key消息，消费失败 topic: {} message: {}", topic, message);
            throw e;
        }
    }
}
