package com.yuhui.marketing.reward.behavior.model.entity;

import com.yuhui.marketing.reward.behavior.event.SendRebateMessageEvent;
import com.yuhui.marketing.reward.behavior.model.valobj.TaskStateVO;
import com.yuhui.types.event.BaseEvent;
import lombok.Data;

/**

 * 任务实体
 */
@Data
public class TaskEntity {
    /**
     * 活动ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 消息主题
     */
    private String topic;
    /**
     * 消息编号
     */
    private String messageId;
    /**
     * 消息主体
     */
    private BaseEvent.EventMessage<SendRebateMessageEvent.RebateMessage> message;
    /**
     * 任务状态；create-创建、completed-完成、fail-失败
     */
    private TaskStateVO state;
}
