package com.yuhui.querys.model.valobj;


import lombok.Data;

import java.util.Date;

@Data
public class EsUserAwardRecordVO {
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
     * 抽奖策略ID
     */
    private Long strategyId;

    /**
     * 抽奖订单ID【作为幂等使用】
     */
    private Long userOrderId;

    /**
     * 奖品ID
     */
    private Long awardId;

    private String image;

    /**
     * 奖品标题（名称）
     */
    private String awardTitle;

    /**
     * 中奖时间
     */
    private Date awardTime;

    /**
     * 奖品状态；create-创建、completed-发奖完成、、fail-发奖失败
     */
    private String awardState;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
