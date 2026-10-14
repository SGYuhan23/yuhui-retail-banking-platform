package com.yuhui.marketing.participation.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**

 * 未支付订单实体
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UnpaidQuotaOrderEntity {
    // 用户ID
    private String userId;
    // 活动ID
    private Long activityId;
    // 订单ID
    private String orderId;
    // 外部透传ID
    private String outBusinessNo;
    // 订单金额
    private BigDecimal payAmount;
}
