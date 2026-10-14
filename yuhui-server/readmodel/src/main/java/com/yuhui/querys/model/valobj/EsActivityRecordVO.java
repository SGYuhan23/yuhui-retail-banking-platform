package com.yuhui.querys.model.valobj;


import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class EsActivityRecordVO {
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
     * 商品sku
     */
    private Long sku;

    /**
     * 活动名称
     */
    private String activityName;

    /**
     * 总次数
     */
    private Integer totalCount;

    /**
     * 日次数
     */
    private Integer dayCount;

    /**
     * 月次数
     */
    private Integer monthCount;

    /**
     * 支付积分
     */
    private BigDecimal payAmount;

    /**
     * 订单状态（complete）
     */
    private String state;

    /**
     * 保证幂等，不会重复消费
     */
    private String outBusinessNo;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
