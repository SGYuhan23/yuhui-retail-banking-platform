package com.yuhui.marketing.points.model.aggregate;

import com.yuhui.marketing.points.event.CreditAdjustSuccessMessageEvent;
import com.yuhui.marketing.points.model.entity.CreditAccountEntity;
import com.yuhui.marketing.points.model.entity.CreditOrderEntity;
import com.yuhui.marketing.points.model.entity.TaskEntity;
import com.yuhui.marketing.points.model.valobj.TaskStateVO;
import com.yuhui.marketing.points.model.valobj.TradeNameVO;
import com.yuhui.marketing.points.model.valobj.TradeTypeVO;
import com.yuhui.types.event.BaseEvent;
import lombok.Data;
import org.apache.commons.lang3.RandomStringUtils;

import java.math.BigDecimal;

/**

 * 交易聚合对象
 */
@Data
public class TradeAggregate {
    // 用户ID
    private String userId;
    // 积分账户实体
    private CreditAccountEntity creditAccountEntity;
    // 积分订单实体
    private CreditOrderEntity creditOrderEntity;
    // 任务实体
    private TaskEntity taskEntity;

    public static CreditAccountEntity buildCreditAccountEntity(String userId, Long activityId,BigDecimal creditAmount) {
        return CreditAccountEntity.builder().userId(userId).activityId(activityId).creditAmount(creditAmount).build();
    }

    public static CreditOrderEntity buildCreditOrderEntity(String userId, Long activityId,TradeNameVO tradeName, TradeTypeVO tradeType, BigDecimal tradeAmount, String outBusinessNo) {
        return CreditOrderEntity.builder()
                .userId(userId)
                .activityId(activityId)
                .orderId(RandomStringUtils.randomNumeric(12))
                .tradeName(tradeName)
                .tradeType(tradeType)
                .tradeAmount(tradeAmount)
                .outBusinessNo(outBusinessNo)
                .build();
    }

    public static TaskEntity buildTaskEntity(String userId,Long activityId, String topic, String messageId, BaseEvent.EventMessage<CreditAdjustSuccessMessageEvent.CreditAdjustSuccessMessage> message) {
        TaskEntity taskEntity = new TaskEntity();
        taskEntity.setUserId(userId);
        taskEntity.setActivityId(activityId);
        taskEntity.setTopic(topic);
        taskEntity.setMessageId(messageId);
        taskEntity.setMessage(message);
        taskEntity.setState(TaskStateVO.create);
        return taskEntity;
    }


}
