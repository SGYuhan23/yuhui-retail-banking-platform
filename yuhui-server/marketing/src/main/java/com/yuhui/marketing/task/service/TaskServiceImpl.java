package com.yuhui.marketing.task.service;
import com.yuhui.marketing.task.model.entity.TaskEntity;
import com.yuhui.marketing.task.repository.TaskRepository;
import com.yuhui.marketing.task.repository.TaskMessagePublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
@Slf4j @Service
public class TaskServiceImpl implements TaskService {
    private final TaskRepository ledger;
    private final TaskMessagePublisher publisher;
    public TaskServiceImpl(TaskRepository ledger, TaskMessagePublisher publisher) {
        this.ledger = ledger; this.publisher = publisher;
    }
    @Override public void dispatchPendingBatch() {
        for (TaskEntity task : ledger.queryNoSendMessageTaskList()) {
            try {
                publisher.publish(task);
                // A failed confirm or completion write remains retryable, never silently acknowledged.
                ledger.updateTaskSendMessageCompleted(task.getUserId(), task.getMessageId());
            } catch (Exception failure) {
                ledger.updateTaskSendMessageFail(task.getUserId(), task.getMessageId());
                log.warn("Outbox retry pending messageId:{}", task.getMessageId(), failure);
            }
        }
    }
}
