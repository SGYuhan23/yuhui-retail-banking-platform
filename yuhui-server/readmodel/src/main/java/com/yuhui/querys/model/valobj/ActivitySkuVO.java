package com.yuhui.querys.model.valobj;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class ActivitySkuVO {
    private Long id;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 活动个人参与次数ID
     */
    private Long activityCountId;

    /**
     * 商品库存
     */
    private Integer stockCount;

    /**
     * 剩余库存
     */
    private Integer stockCountSurplus;

    /**
     * 兑换所需积分
     */
    private BigDecimal productAmount;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
