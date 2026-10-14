package com.yuhui.trigger.api.dto.req;


import lombok.Data;

import java.math.BigDecimal;

@Data
public class ActivitySkuRequestDTO {
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

}
