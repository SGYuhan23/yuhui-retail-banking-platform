package com.yuhui.trigger.listener;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.yuhui.marketing.raffle.service.Stock;
import com.yuhui.types.event.BaseEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**

 * @description 奖品库存耗尽
 */
@Slf4j
@Component
public class AwardStockZeroCustomer {
    @Value("${spring.rabbitmq.topic.award_stock_zero}")
    private String topic;
    @Resource
    private Stock stock;
    @RabbitListener(queuesToDeclare = @Queue(value = "${spring.rabbitmq.topic.award_stock_zero}"))
    public void listener(String message) {
        try {
            log.info("监听奖品库存消耗为0消息 topic: {} message: {}", topic, message);
            // 转换对象
            BaseEvent.EventMessage<String> eventMessage = JSON.parseObject(message, new TypeReference<BaseEvent.EventMessage<String>>() {
            }.getType());
            String strategyAward = eventMessage.getData();
            // 更新库存
            stock.clearAwardStock(strategyAward);
            // 清空阻塞队列与延迟队列
            stock.clearQueueValue(strategyAward);
        } catch (Exception e) {
            log.error("监听奖品库存消耗为0消息，消费失败 topic: {} message: {}", topic, message);
            throw e;
        }
    }
}
