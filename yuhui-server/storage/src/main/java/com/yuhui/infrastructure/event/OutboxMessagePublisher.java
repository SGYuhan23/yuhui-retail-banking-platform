package com.yuhui.infrastructure.event;
import com.yuhui.marketing.task.model.entity.TaskEntity;
import com.yuhui.marketing.task.repository.TaskMessagePublisher;
import org.springframework.stereotype.Component;
@Component
public class OutboxMessagePublisher implements TaskMessagePublisher {
    private final EventPublisher events;
    public OutboxMessagePublisher(EventPublisher events) { this.events = events; }
    @Override public void publish(TaskEntity task) { events.publish(task.getTopic(), task.getMessage()); }
}
