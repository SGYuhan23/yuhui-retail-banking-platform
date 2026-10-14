package com.yuhui.marketing.reward.fulfillment.model.aggregate;

import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserCreditAwardEntity;
import com.yuhui.marketing.reward.fulfillment.model.valobj.AwardStateVO;
import lombok.Data;

import java.math.BigDecimal;

/**

 * 发奖聚合对象
 */
@Data
public class GiveOutPrizesAggregate {
    /** 用户ID */
    private String userId;
    /** 用户发奖记录 */
    private UserAwardRecordEntity userAwardRecordEntity;
    /** 用户积分奖品 */
    private UserCreditAwardEntity userCreditAwardEntity;

    public static UserAwardRecordEntity buildUserAwardRecordEntity(Long id,String userId,Long activityId, Long orderId, Long awardId, AwardStateVO awardState) {
        UserAwardRecordEntity userAwardRecord = new UserAwardRecordEntity();
        userAwardRecord.setId(id);
        userAwardRecord.setActivityId(activityId);
        userAwardRecord.setUserId(userId);
        userAwardRecord.setUserOrderId(orderId);
        userAwardRecord.setAwardId(awardId);
        userAwardRecord.setAwardState(awardState);
        return userAwardRecord;
    }
    public static UserCreditAwardEntity buildUserCreditAwardEntity(String userId, Long activityId,BigDecimal creditAmount) {
        UserCreditAwardEntity userCreditAward = new UserCreditAwardEntity();
        userCreditAward.setActivityId(activityId);
        userCreditAward.setUserId(userId);
        userCreditAward.setCreditAmount(creditAmount);
        return userCreditAward;
    }
}
