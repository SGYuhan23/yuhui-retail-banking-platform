package com.yuhui.marketing.reward.behavior.model.entity;

import com.yuhui.marketing.reward.behavior.model.valobj.BehaviorTypeVO;
import lombok.Data;

/**

 * 行为实体
 */
@Data
public class BehaviorEntity {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 返利ID
     */
    private Long behaviorRebateId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 行为类型；sign 签到、openai_pay 支付、activity_gift 活动赠送
     */
    private BehaviorTypeVO behaviorTypeVO;
    /**
     * 业务ID；签到则是日期字符串，支付则是外部的业务ID
     */
    private String outBusinessNo;
}
