package com.yuhui.infrastructure.event;
import com.yuhui.infrastructure.dao.TaskMapper;
import com.yuhui.infrastructure.dao.po.Task;
import com.yuhui.types.event.BaseEvent;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
/** Invoked only after the ledger transaction commits. A delivery error must not undo committed business facts. */
@Component @Slf4j
public class CommittedOutboxDelivery {
    private final EventPublisher publisher;
    private final TaskMapper tasks;
    public CommittedOutboxDelivery(EventPublisher publisher, TaskMapper tasks) {
        this.publisher=publisher; this.tasks=tasks;
    }
    public void attempt(Task identity, String topic, BaseEvent.EventMessage<?> message) {
        try {
            publisher.publish(topic, message);
            tasks.updateTaskSendMessageCompleted(identity);
        } catch (Exception failure) {
            log.warn("Committed outbox delivery pending messageId:{}", identity.getMessageId(), failure);
            tasks.updateTaskSendMessageFail(identity);
        }
    }
}
