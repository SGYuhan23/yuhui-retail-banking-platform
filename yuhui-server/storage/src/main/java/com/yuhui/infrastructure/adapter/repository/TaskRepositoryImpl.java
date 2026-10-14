package com.yuhui.infrastructure.adapter.repository;

import com.yuhui.marketing.task.model.entity.TaskEntity;
import com.yuhui.marketing.task.repository.TaskRepository;
import com.yuhui.infrastructure.dao.TaskMapper;
import com.yuhui.infrastructure.dao.po.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**

 * 任务领域仓储实现
 */
@Repository
@Slf4j
public class TaskRepositoryImpl implements TaskRepository {
    @Resource
    private TaskMapper taskMapper;


    @Override
    public List<TaskEntity> queryNoSendMessageTaskList() {
        List<Task> tasks = taskMapper.queryNoSendMessageTaskList();
        List<TaskEntity> taskEntities = new ArrayList<>(tasks.size());
        for (Task task : tasks) {
            TaskEntity taskEntity = new TaskEntity();
            taskEntity.setUserId(task.getUserId());
            taskEntity.setTopic(task.getTopic());
            taskEntity.setMessageId(task.getMessageId());
            taskEntity.setMessage(task.getMessage());
            taskEntities.add(taskEntity);
        }
        return taskEntities;
    }

    @Override
    public void updateTaskSendMessageCompleted(String userId, String messageId) {
        Task taskReq = new Task();
        taskReq.setUserId(userId);
        taskReq.setMessageId(messageId);
        taskMapper.updateTaskSendMessageCompleted(taskReq);
        log.debug("[TaskRepositoryImpl]更新任务状态为 completed 已完成成功 userId: {} messageId: {}", userId, messageId);
    }

    @Override
    public void updateTaskSendMessageFail(String userId, String messageId) {
        Task taskReq = new Task();
        taskReq.setUserId(userId);
        taskReq.setMessageId(messageId);
        taskMapper.updateTaskSendMessageFail(taskReq);
        log.debug("[TaskRepositoryImpl]更新任务状态为 fail 失败成功 userId: {} messageId: {}", userId, messageId);
    }
}
