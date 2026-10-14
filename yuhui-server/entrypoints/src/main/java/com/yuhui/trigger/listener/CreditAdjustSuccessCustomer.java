package com.yuhui.trigger.listener;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.yuhui.marketing.participation.model.entity.DeliveryOrderEntity;
import com.yuhui.marketing.participation.service.ActivityQuotaService;
import com.yuhui.marketing.points.event.CreditAdjustSuccessMessageEvent;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.event.BaseEvent;
import com.yuhui.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
/**

 * @description 积分调整成功消息
 */
@Slf4j
@Component
public class CreditAdjustSuccessCustomer {

    @Value("${spring.rabbitmq.topic.credit_adjust_success}")
    private String topic;
    @Resource
    private ActivityQuotaService activityQuotaService;

    @RabbitListener(queuesToDeclare = @Queue(value = "${spring.rabbitmq.topic.credit_adjust_success}"))
    public void listener(String message) {
        try {
            log.info("[CreditAdjustSuccessCustomer]监听到积分账户调整成功消息，进行交易商品发放 topic: {} message: {}", topic, message);
            BaseEvent.EventMessage<CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage> eventMessage = JSON.parseObject(message, new TypeReference<BaseEvent.EventMessage<CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage>>() {
            }.getType());
            CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage creditAdjustSuccessMessage = eventMessage.getData();
            // 积分发货
            DeliveryOrderEntity deliveryOrderEntity = new DeliveryOrderEntity();
            deliveryOrderEntity.setUserId(creditAdjustSuccessMessage.getUserId());
            deliveryOrderEntity.setActivityId(creditAdjustSuccessMessage.getActivityId());
            deliveryOrderEntity.setOutBusinessNo(creditAdjustSuccessMessage.getOutBusinessNo());
            activityQuotaService.updateQuotaOrder(deliveryOrderEntity);
            log.info("[CreditAdjustSuccessCustomer]积分账户调整成功消息，进行交易商品发货成功 topic: {} message: {}", topic, message);
        } catch (AppException ae) {
            if (ResponseCode.INDEX_DUP.getCode()==ae.getCode()) {
                log.warn("[CreditAdjustSuccessCustomer]积分账户调整成功消息，进行交易商品发货，消费重复 topic: {} message: {}", topic, message, ae);
                return;
            }
            throw ae;
        } catch (Exception e) {
            log.error("[CreditAdjustSuccessCustomer]积分账户调整成功消息，进行交易商品发货失败 topic: {} message: {}", topic, message, e);
            throw e;
        }
    }

}

