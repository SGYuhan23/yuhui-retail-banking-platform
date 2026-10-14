package com.yuhui.marketing.reward.behavior.model.entity;

import lombok.Data;

/**

 * 返利单实体
 */
@Data
public class RebateOrderEntity {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 返利配置ID
     */
    private Long behaviorRebateId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 订单ID
     */
    private String orderId;
    /**
     * 行为类型（sign 签到、openai_pay 支付、activity_gift 活动赠送）
     */
    private String behaviorType;
    /**
     * 返利描述
     */
    private String rebateDesc;
    /**
     * 返利类型（sku 活动库存充值商品、integral 用户活动积分、gift 活动赠送的抽奖额度）
     */
    private String rebateType;
    /**
     * 返利配置【sku值，积分值】
     */
    private String rebateConfig;
    /**
     * 外部业务号
     */
    private String outBusinessNo;
    /**
     * 业务ID - 拼接的唯一值
     */
    private String bizId;
}
