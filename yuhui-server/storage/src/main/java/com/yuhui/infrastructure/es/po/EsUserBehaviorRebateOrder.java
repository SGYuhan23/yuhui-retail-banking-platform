package com.yuhui.infrastructure.es.po;

import lombok.Data;

import java.util.Date;

/**
 * 用户行为返利流水表
 *

 * @TableName user_behavior_rebate_order
 */
@Data
public class EsUserBehaviorRebateOrder {
    /**
     * 雪花ID
     */
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
     * 行为类型（sign 签到、openai_pay 支付）
     */
    private String behaviorType;

    /**
     * 返利描述
     */
    private String rebateDesc;

    /**
     * 返利类型（sku 活动库存充值商品、integral 用户活动积分）
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

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

}