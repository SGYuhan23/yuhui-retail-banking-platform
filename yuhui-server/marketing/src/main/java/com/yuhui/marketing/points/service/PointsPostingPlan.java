package com.yuhui.marketing.points.service;

import com.yuhui.marketing.points.event.CreditAdjustSuccessMessageEvent;
import com.yuhui.marketing.points.model.aggregate.TradeAggregate;
import com.yuhui.marketing.points.model.entity.CreditAccountEntity;
import com.yuhui.marketing.points.model.entity.CreditOrderEntity;
import com.yuhui.marketing.points.model.entity.TaskEntity;
import com.yuhui.marketing.points.model.entity.TradeEntity;
import com.yuhui.types.event.BaseEvent;
import org.springframework.stereotype.Service;


/** Creates the account, journal and outbox plan as one unit before the repository transaction. */
@Service
public class PointsPostingPlan {
    private final CreditAdjustSuccessMessageEvent creditAdjustSuccessMessageEvent;
    public PointsPostingPlan(CreditAdjustSuccessMessageEvent event) { this.creditAdjustSuccessMessageEvent=event; }
    public TradeAggregate prepare(TradeEntity tradeEntity) {
        CreditAccountEntity creditAccountEntity = TradeAggregate.buildCreditAccountEntity(tradeEntity.getUserId(),tradeEntity.getActivityId(), tradeEntity.getAmount());
        CreditOrderEntity creditOrderEntity = TradeAggregate.buildCreditOrderEntity(tradeEntity.getUserId(),tradeEntity.getActivityId(), tradeEntity.getTradeName(), tradeEntity.getTradeType(), tradeEntity.getAmount(), tradeEntity.getOutBusinessNo());
        CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage creditAdjustSuccessMessage = new CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage();
        creditAdjustSuccessMessage.setUserId(tradeEntity.getUserId());
        creditAdjustSuccessMessage.setActivityId(tradeEntity.getActivityId());
        creditAdjustSuccessMessage.setOrderId(creditOrderEntity.getOrderId());
        creditAdjustSuccessMessage.setAmount(creditOrderEntity.getTradeAmount());
        creditAdjustSuccessMessage.setOutBusinessNo(creditOrderEntity.getOutBusinessNo());
        BaseEvent.EventMessage<CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage> creditAdjustSuccessMessageEventMessage = creditAdjustSuccessMessageEvent.buildEventMessage(creditAdjustSuccessMessage);
        TaskEntity taskEntity = TradeAggregate.buildTaskEntity(tradeEntity.getUserId(),tradeEntity.getActivityId(), creditAdjustSuccessMessageEvent.topic(), creditAdjustSuccessMessageEventMessage.getId(), creditAdjustSuccessMessageEventMessage);
        TradeAggregate tradeAggregate = new TradeAggregate();
        tradeAggregate.setUserId(tradeEntity.getUserId());
        tradeAggregate.setCreditAccountEntity(creditAccountEntity);
        tradeAggregate.setCreditOrderEntity(creditOrderEntity);
        tradeAggregate.setTaskEntity(taskEntity);
        return tradeAggregate;
    }
}
