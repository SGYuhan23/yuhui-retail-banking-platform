package com.yuhui.marketing.task.repository;
import com.yuhui.marketing.task.model.entity.TaskEntity;
public interface TaskMessagePublisher { void publish(TaskEntity task); }
