package com.yuhui.marketing.participation.model.aggregate;

import com.yuhui.marketing.participation.model.entity.ActivityOrderEntity;
import lombok.Builder;
import lombok.Data;

/**

 * 额度单聚合对象
 */
@Data
@Builder
public class CreateQuotaOrderAggregate {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 增加；总次数
     */
    private Integer totalCount;
    /**
     * 增加；日次数
     */
    private Integer dayCount;
    /**
     * 增加；月次数
     */
    private Integer monthCount;
    /**
     * 活动订单实体
     */
    private ActivityOrderEntity activityOrderEntity;

}
