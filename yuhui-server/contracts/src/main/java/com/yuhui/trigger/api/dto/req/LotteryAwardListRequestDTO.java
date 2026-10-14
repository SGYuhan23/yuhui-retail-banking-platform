package com.yuhui.trigger.api.dto.req;

import lombok.Data;

/**

 * 查询抽奖奖品列表，入参
 */
@Data
public class LotteryAwardListRequestDTO {
    // 抽奖策略ID
    @Deprecated
    private Long strategyId;
    // 活动ID
    private Long activityId;
    //用户ID
    private String userId;
}
