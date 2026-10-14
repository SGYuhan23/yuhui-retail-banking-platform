package com.yuhui.marketing.task.repository;

import com.yuhui.marketing.task.model.entity.TaskEntity;

import java.util.List;

/**

 * 任务领域仓储接口
 */
public interface TaskRepository {
    List<TaskEntity> queryNoSendMessageTaskList();

    void updateTaskSendMessageCompleted(String userId, String messageId);

    void updateTaskSendMessageFail(String userId, String messageId);
}
