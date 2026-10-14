package com.yuhui.marketing.reward.fulfillment.model.entity;

import com.yuhui.marketing.reward.fulfillment.event.SendAwardMessageEvent;
import com.yuhui.marketing.reward.fulfillment.model.valobj.TaskStateVO;
import com.yuhui.types.event.BaseEvent;
import lombok.Data;

@Data
public class TaskEntity {
    /**
     * 消息主题
     */
    private String topic;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 消息ID
     */
    private String messageId;

    /**
     * 消息主体
     */
    private BaseEvent.EventMessage<SendAwardMessageEvent.SendAwardMessage> message;

    /**
     * 任务状态；create-创建、completed-完成、fail-失败
     */
    private TaskStateVO state;
}
