package com.yuhui.marketing.participation.model.entity;

import lombok.Data;

import java.math.BigDecimal;

/**

 * 活动sku实体对象
 */
@Data
public class ActivitySkuEntity {
    /** 商品sku */
    private Long id;
    /** 活动ID */
    private Long activityId;
    /** 活动个人参数ID；在这个活动上，一个人可参与多少次活动（总、日、月） */
    private Long activityCountId;
    /** 库存总量 */
    private Integer stockCount;
    /** 剩余库存 */
    private Integer stockCountSurplus;
    /** 兑换所需积分 */
    private BigDecimal productAmount;

}
