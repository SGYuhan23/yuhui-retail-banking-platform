package com.yuhui.marketing.participation.model.entity;

import com.yuhui.marketing.participation.model.valobj.UserOrderStateVO;
import lombok.Data;

import java.util.Date;

/**

 * 创建抽奖单响应体
 */
@Data
public class PartakeOrderResEntity {
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
     * 活动名称
     */
    private String activityName;

    /**
     * 抽奖策略ID
     */
    private Long strategyId;


    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 订单状态；create-创建、used-已使用、cancel-已作废
     */
    private UserOrderStateVO orderState;
}
