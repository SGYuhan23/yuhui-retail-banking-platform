package com.yuhui.aop;

import com.yuhui.infrastructure.event.EventPublisher;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixAsync;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**

 * 操作结束后删除以前缀开头的旧缓存
 */
@Aspect
@Slf4j
@Component
public class DeleteOldCacheWithPrefixAsyncAOP {
    @Resource
    private EventPublisher eventPublisher;
    @Value("${spring.rabbitmq.topic.delete_keys_with_prefix}")
    private String topic;

    /**
     * 使用后置通知，在方法执行结束后且无异常时执行
     */
    @AfterReturning("@annotation(com.yuhui.types.annotation.DeleteOldCacheWithPrefixAsync)&&@annotation(deleteOldCacheWithPrefixAsync)")
    public void after(JoinPoint joinPoint, DeleteOldCacheWithPrefixAsync deleteOldCacheWithPrefixAsync) {
        String[] key = deleteOldCacheWithPrefixAsync.key();
        for (String s : key) {
            try {
                eventPublisher.publish(topic, s);
                log.debug("[DeleteOldCacheWithPrefixAOP]删除缓存key，MQ消息发送成功 key_prefix: {} topic: {}", s, topic);
            } catch (Exception e) {
                log.error("[DeleteOldCacheWithPrefixAOP]删除缓存key，MQ消息发送失败 key_prefix: {} topic: {}", s, topic);
            }
        }

    }
}
