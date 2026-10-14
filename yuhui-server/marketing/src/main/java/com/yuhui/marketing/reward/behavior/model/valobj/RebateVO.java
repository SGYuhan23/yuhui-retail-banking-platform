package com.yuhui.marketing.reward.behavior.model.valobj;

import lombok.Builder;
import lombok.Getter;

/**

 * 返利值对象
 */
@Getter
@Builder
public class RebateVO {

    /**
     * 返利配置ID
     */
    private Long behaviorRebateId;
    /**
     * 行为类型（sign 签到、openai_pay 支付、activity_gift 活动赠送）
     */
    private String behaviorType;
    /**
     * 返利描述
     */
    private String rebateDesc;
    /**
     * 返利类型（sku 充值抽奖次数、integral 用户活动积分）
     */
    private String rebateType;
    /**
     * 返利配置
     */
    private String rebateConfig;
}
