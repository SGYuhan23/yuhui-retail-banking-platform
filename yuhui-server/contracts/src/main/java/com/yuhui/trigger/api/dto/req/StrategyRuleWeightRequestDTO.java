package com.yuhui.trigger.api.dto.req;

import lombok.Data;

/**

 * 查询活动策略权重，入参
 */
@Data
public class StrategyRuleWeightRequestDTO {
    private String userId;
    private Long activityId;
}
