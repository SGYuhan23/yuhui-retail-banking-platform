package com.yuhui.marketing.participation.model.valobj;

import lombok.*;

/**

 * @description 活动sku库存 key 值对象
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivitySkuStockKeyVO {

    /** 商品sku */
    private Long sku;
    /** 活动ID */
    private Long activityId;

}

