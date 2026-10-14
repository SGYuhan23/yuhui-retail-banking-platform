package com.yuhui.infrastructure.es.po;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 积分账户表
 *

 * @TableName credit_account
 */
@Data
public class EsCreditAccount {

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
     * 总积分，显示总账户值，记得一个人获得的总积分
     */
    private BigDecimal totalAmount;

    /**
     * 可用积分
     */
    private BigDecimal availableAmount;

    /**
     * 账户状态【open - 可用，close - 冻结】
     */
    private String accountStatus;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}