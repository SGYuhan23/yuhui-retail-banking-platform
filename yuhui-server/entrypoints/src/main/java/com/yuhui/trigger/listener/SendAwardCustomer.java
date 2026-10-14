package com.yuhui.trigger.listener;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.yuhui.marketing.reward.fulfillment.event.SendAwardMessageEvent;
import com.yuhui.marketing.reward.fulfillment.model.entity.DistributeAwardEntity;
import com.yuhui.marketing.reward.fulfillment.service.UserAwardService;
import com.yuhui.types.event.BaseEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**

 * 发奖
 */
@Slf4j
@Component
public class SendAwardCustomer {
    @Value("${spring.rabbitmq.topic.send_award}")
    private String topic;

    @Resource
    private UserAwardService userAwardService;

    @RabbitListener(queuesToDeclare = @Queue(value = "${spring.rabbitmq.topic.send_award}"))
    public void listener(String message) {
        try {
            log.info("[SendAwardCustomer]监听到用户发奖消息 topic: {} message: {}", topic, message);
            BaseEvent.EventMessage<SendAwardMessageEvent.SendAwardMessage> eventMessage = JSON.parseObject(message, new TypeReference<BaseEvent.EventMessage<SendAwardMessageEvent.SendAwardMessage>>() {
            }.getType());
            SendAwardMessageEvent.SendAwardMessage sendAwardMessage = eventMessage.getData();
            // 发奖
            DistributeAwardEntity distributeAwardEntity = new DistributeAwardEntity();
            distributeAwardEntity.setAwardConfig(sendAwardMessage.getAwardConfig());
            distributeAwardEntity.setAwardId(sendAwardMessage.getAwardId());
            distributeAwardEntity.setUserOrderId(sendAwardMessage.getUserOrderId());
            distributeAwardEntity.setUserId(sendAwardMessage.getUserId());
            distributeAwardEntity.setActivityId(sendAwardMessage.getActivityId());
            userAwardService.distributeAward(distributeAwardEntity);
            log.info("[SendAwardCustomer]用户发奖消息，消费成功 topic: {} message: {}", topic, message);
        } catch (Exception e) {
            log.error("[SendAwardCustomer]用户发奖消息，消费失败 topic: {} message: {}", topic, message);
            throw e;
        }
    }
}
