package com.yuhui.trigger.api.dto.req;


import lombok.Data;

/**

 * 添加抽奖额度请求参数
 */
@Data
public class AddLotteryQuotaRequestDTO {
    private String userId;
    private Long activityId;
    private Long behaviorRebateId;
}
