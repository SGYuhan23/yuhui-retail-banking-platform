package com.yuhui.trigger.api.dto.res;

import lombok.Data;

import java.util.List;

/**

 * 查询活动策略权重，出参
 */
@Data
public class StrategyRuleWeightResponseDTO {
    // 权重规则配置的抽奖次数
    private Integer ruleWeightCount;
    // 用户已经抽奖总次数
    private Integer userActivityAccountTotalUseCount;
    // 当前权重中奖抽奖范围
    private List<StrategyAward> strategyAwards;
    @Data
    public static class StrategyAward {
        // 奖品ID
        private Long awardId;
        // 奖品标题
        private String awardTitle;
    }
}
