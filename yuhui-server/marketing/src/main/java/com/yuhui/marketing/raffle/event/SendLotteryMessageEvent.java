package com.yuhui.marketing.raffle.event;

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

 * mq发送中奖消息
 */
@Component
public class SendLotteryMessageEvent extends BaseEvent<SendLotteryMessageEvent.LotteryMessage> {

    @Value("${spring.rabbitmq.topic.lottery}")
    private String topic;
    @Override
    public EventMessage<LotteryMessage> buildEventMessage(LotteryMessage data) {
        return EventMessage.<LotteryMessage>builder()
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
    public static class LotteryMessage {
        private String userId;

        private String activityId;

        /**
         * 中奖时间
         */
        private Date awardTime;
        /**
         * 抽奖奖品ID
         */
        private Long awardId;

        /**
         * 奖品名称
         */
        private String awardTitle;

        /**
         * 奖品配置信息
         */
        private String awardConfig;

        /**
         * 奖品顺序号
         */
        private Integer sort;
    }
}
