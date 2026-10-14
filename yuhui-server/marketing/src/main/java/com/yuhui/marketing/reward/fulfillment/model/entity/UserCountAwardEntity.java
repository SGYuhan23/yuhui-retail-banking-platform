package com.yuhui.marketing.reward.fulfillment.model.entity;

import lombok.Data;


/**

 * 积分发奖实体
 */
@Data
public class UserCountAwardEntity {
    /** 用户ID */
    private String userId;
    /** 活动ID */
    private Long activityId;
    /** 次数 */
    private Integer count;
}
