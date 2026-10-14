package com.yuhui.trigger.api.dto.req;

import lombok.Data;

/**

 * 积分支付兑换商品，入参
 */
@Data
public class SkuProductShopCartRequestDTO {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * sku 商品
     */
    private Long sku;
}
