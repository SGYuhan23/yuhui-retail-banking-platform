package com.yuhui.marketing.participation.event;

import com.yuhui.types.event.BaseEvent;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**

 * @description 奖品库存清空消息（基本消息事件的组装）
 */
@Component
public class AwardStockZeroMessageEvent extends BaseEvent<String> {

    @Value("${spring.rabbitmq.topic.award_stock_zero}")
    private String topic;

    @Override
    public EventMessage<String> buildEventMessage(String strategyAward) {
        return EventMessage.<String>builder()
                .id(RandomStringUtils.randomNumeric(11))
                .timestamp(new Date())
                .data(strategyAward)
                .build();
    }

    @Override
    public String topic() {
        return topic;
    }
}

