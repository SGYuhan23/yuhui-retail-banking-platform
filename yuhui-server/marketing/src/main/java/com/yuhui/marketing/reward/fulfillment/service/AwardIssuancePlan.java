package com.yuhui.marketing.reward.fulfillment.service;

import com.yuhui.marketing.reward.fulfillment.event.SendAwardMessageEvent;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.UserAwardRecordAggregate;
import com.yuhui.marketing.reward.fulfillment.model.entity.TaskEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;
import com.yuhui.marketing.reward.fulfillment.model.valobj.TaskStateVO;
import com.yuhui.types.event.BaseEvent;
import org.springframework.stereotype.Service;


/** Issuance is durable before asynchronous fulfillment; both records share the same plan. */
@Service
public class AwardIssuancePlan {
    private final SendAwardMessageEvent sendAwardMessageEvent;
    public AwardIssuancePlan(SendAwardMessageEvent event) { this.sendAwardMessageEvent=event; }
    public UserAwardRecordAggregate prepare(UserAwardRecordEntity userAwardRecordEntity) {
        SendAwardMessageEvent.SendAwardMessage message = new SendAwardMessageEvent.SendAwardMessage();
        message.setAwardId(userAwardRecordEntity.getAwardId());
        message.setAwardTitle(userAwardRecordEntity.getAwardTitle());
        message.setUserId(userAwardRecordEntity.getUserId());
        message.setActivityId(userAwardRecordEntity.getActivityId());
        message.setUserOrderId(userAwardRecordEntity.getUserOrderId());
        message.setAwardConfig(userAwardRecordEntity.getAwardConfig());
        BaseEvent.EventMessage<SendAwardMessageEvent.SendAwardMessage> sendAwardMessageEventMessage = sendAwardMessageEvent.buildEventMessage(message);
        TaskEntity taskEntity = new TaskEntity();
        taskEntity.setUserId(userAwardRecordEntity.getUserId());
        taskEntity.setActivityId(userAwardRecordEntity.getActivityId());
        taskEntity.setTopic(sendAwardMessageEvent.topic());
        taskEntity.setMessageId(sendAwardMessageEventMessage.getId());
        taskEntity.setMessage(sendAwardMessageEventMessage);
        taskEntity.setState(TaskStateVO.create);
        UserAwardRecordAggregate userAwardRecordAggregate = new UserAwardRecordAggregate();
        userAwardRecordAggregate.setTaskEntity(taskEntity);
        userAwardRecordAggregate.setUserAwardRecordEntity(userAwardRecordEntity);
        return userAwardRecordAggregate;
    }
}
