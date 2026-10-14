package com.yuhui.marketing.reward.fulfillment.event;

import com.yuhui.types.event.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**

 * 奖品事件消息（基本消息事件的组装）
 */
@Component
public class SendAwardMessageEvent extends BaseEvent<SendAwardMessageEvent.SendAwardMessage> {
    @Value("${spring.rabbitmq.topic.send_award}")
    private String topic;

    @Override
    public EventMessage<SendAwardMessage> buildEventMessage(SendAwardMessage data) {
        return EventMessage.<SendAwardMessageEvent.SendAwardMessage>builder()
                .id(RandomStringUtils.randomNumeric(11))
                .timestamp(new Date())
                .data(data)
                .build();
    }

    @Override
    public String topic() {
        return topic;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SendAwardMessage {
        /**
         * 用户ID
         */
        private String userId;
        /**
         * 活动ID
         */
        private Long activityId;
        /**
         * 奖品ID
         */
        private Long awardId;
        /**
         * 奖品标题（名称）
         */
        private String awardTitle;
        /**
         * 订单ID
         */
        private Long userOrderId;
        /**
         * 奖品配置信息
         */
        private String awardConfig;

    }
}
