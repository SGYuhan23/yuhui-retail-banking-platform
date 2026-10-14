package com.yuhui.marketing.participation.model.entity;

import lombok.Data;

/**

 * 出货单实体对象
 */
@Data
public class DeliveryOrderEntity {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 业务仿重ID - 外部透传。返利、行为等唯一标识
     */
    private String outBusinessNo;

}
