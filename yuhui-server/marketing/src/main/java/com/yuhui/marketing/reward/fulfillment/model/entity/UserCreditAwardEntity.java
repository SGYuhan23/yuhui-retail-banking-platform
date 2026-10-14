package com.yuhui.marketing.reward.fulfillment.model.entity;

import lombok.Data;

import java.math.BigDecimal;

/**

 * 积分发奖实体
 */
@Data
public class UserCreditAwardEntity {
    /** 用户ID */
    private String userId;
    /** 活动ID */
    private Long activityId;
    /** 积分值 */
    private BigDecimal creditAmount;
}
