package com.yuhui.marketing.reward.fulfillment.model.entity;

import lombok.Data;

/**

 * 发奖实体
 */
@Data
public class DistributeAwardEntity {
    private Long id;
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 订单ID
     */
    private Long userOrderId;
    /**
     * 奖品ID
     */
    private Long awardId;
    /**
     * 奖品配置信息
     */
    private String awardConfig;
}
