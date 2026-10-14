package com.yuhui.infrastructure.es.po;

import lombok.Data;

import java.util.Date;

/**
 * 抽奖活动账户表-月次数
 *

 * @TableName activity_account_month
 */
@Data
public class EsActivityAccountMonth {
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
     * 月（yyyy-mm）
     */
    private String month;

    /**
     * 月次数
     */
    private Integer monthCount;

    /**
     * 月次数-剩余
     */
    private Integer monthCountSurplus;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

}