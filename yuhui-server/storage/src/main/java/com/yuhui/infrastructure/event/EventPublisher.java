package com.yuhui.infrastructure.event;
import com.alibaba.fastjson.JSON;
import com.yuhui.types.event.BaseEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/** Publish is successful only after broker acknowledgement and successful routing. */
@Slf4j @Component
public class EventPublisher {
    @Autowired private RabbitTemplate rabbitTemplate;
    public void publish(String topic, BaseEvent.EventMessage<?> event) { publish(topic, JSON.toJSONString(event)); }
    public void publish(String topic, String message) {
        CorrelationData correlation=new CorrelationData(UUID.randomUUID().toString());
        try {
            rabbitTemplate.convertAndSend("",topic,message,correlation);
            CorrelationData.Confirm confirm=correlation.getFuture().get(5,TimeUnit.SECONDS);
            if(!confirm.isAck() || correlation.getReturned()!=null)
                throw new IllegalStateException("Broker rejected or could not route message: "+topic);
            log.info("[EventPublisher] broker confirmed topic:{} correlation:{}",topic,correlation.getId());
        } catch(InterruptedException e) {
            Thread.currentThread().interrupt(); throw new IllegalStateException("Publish interrupted",e);
        } catch(Exception e) {
            throw new IllegalStateException("Publish not confirmed; retain outbox task: "+topic,e);
        }
    }
}
