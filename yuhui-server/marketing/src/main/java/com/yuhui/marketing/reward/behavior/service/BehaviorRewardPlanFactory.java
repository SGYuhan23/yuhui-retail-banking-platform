package com.yuhui.marketing.reward.behavior.service;

import com.yuhui.marketing.reward.behavior.event.SendRebateMessageEvent;
import com.yuhui.marketing.reward.behavior.model.aggregate.RebateAggregate;
import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
import com.yuhui.marketing.reward.behavior.model.entity.RebateOrderEntity;
import com.yuhui.marketing.reward.behavior.model.entity.TaskEntity;
import com.yuhui.marketing.reward.behavior.model.valobj.RebateVO;
import com.yuhui.marketing.reward.behavior.model.valobj.TaskStateVO;
import com.yuhui.types.common.Constants;
import com.yuhui.types.event.BaseEvent;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;


/** Prepares a ledger entry and its outbox message together; persistence owns their atomic commit. */
@Component
public class BehaviorRewardPlanFactory {
    private final SendRebateMessageEvent sendRebateMessageEvent;
    public BehaviorRewardPlanFactory(SendRebateMessageEvent event) { this.sendRebateMessageEvent = event; }
    public RebateAggregate prepare(BehaviorEntity behaviorEntity, RebateVO rebateVO) {
    String bizId = behaviorEntity.getUserId() + Constants.UNDERLINE + behaviorEntity.getActivityId() + Constants.UNDERLINE + rebateVO.getRebateType() + Constants.UNDERLINE + rebateVO.getBehaviorRebateId() + Constants.UNDERLINE + behaviorEntity.getOutBusinessNo();
    RebateOrderEntity rebateOrderEntity = new RebateOrderEntity();
    BeanUtils.copyProperties(rebateVO, rebateOrderEntity);
    rebateOrderEntity.setOutBusinessNo(behaviorEntity.getOutBusinessNo());
    rebateOrderEntity.setActivityId(behaviorEntity.getActivityId());
    rebateOrderEntity.setBehaviorRebateId(rebateVO.getBehaviorRebateId());
    rebateOrderEntity.setBizId(bizId);
    rebateOrderEntity.setUserId(behaviorEntity.getUserId());
    rebateOrderEntity.setOrderId(RandomStringUtils.randomNumeric(12));

    SendRebateMessageEvent.RebateMessage message = SendRebateMessageEvent.RebateMessage.builder()
            .userId(behaviorEntity.getUserId())
            .activityId(behaviorEntity.getActivityId())
            .rebateType(rebateVO.getRebateType())
            .rebateConfig(rebateVO.getRebateConfig())
            .rebateDesc(rebateVO.getRebateDesc())
            .bizId(bizId)
            .build();
    BaseEvent.EventMessage<SendRebateMessageEvent.RebateMessage> rebateMessageEventMessage = sendRebateMessageEvent.buildEventMessage(message);
    TaskEntity taskEntity = new TaskEntity();
    taskEntity.setUserId(behaviorEntity.getUserId());
    taskEntity.setActivityId(behaviorEntity.getActivityId());
    taskEntity.setTopic(sendRebateMessageEvent.topic());
    taskEntity.setMessageId(rebateMessageEventMessage.getId());
    taskEntity.setMessage(rebateMessageEventMessage);
    taskEntity.setState(TaskStateVO.create);

    RebateAggregate rebateAggregate = new RebateAggregate();
    rebateAggregate.setUserId(behaviorEntity.getUserId());
    rebateAggregate.setActivityId(behaviorEntity.getActivityId());
    rebateAggregate.setRebateOrderEntity(rebateOrderEntity);
    rebateAggregate.setTaskEntity(taskEntity);
        return rebateAggregate;
    }
}
