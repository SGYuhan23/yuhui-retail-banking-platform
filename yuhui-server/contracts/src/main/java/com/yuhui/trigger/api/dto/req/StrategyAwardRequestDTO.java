package com.yuhui.trigger.api.dto.req;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 策略_奖品详情表
 *

 * @TableName activity_award
 */
@Data
public class StrategyAwardRequestDTO {
    /**
     * 雪花ID
     */
    private Long id;
    /**
     * 抽奖策略ID
     */
    private Long activityId;
    /**
     * 抽奖奖品ID
     */
    private Long awardId;
    /**
     * 抽奖奖品标题
     */
    private String awardTitle;
    /**
     * 抽奖奖品副标题
     */
    private String awardSubtitle;
    /**
     * 奖品库存总量
     */
    private Integer awardCount;
    /**
     * 奖品库存剩余
     */
    private Integer awardCountSurplus;
    /**
     * 奖品中奖概率
     */
    private BigDecimal awardRate;
    /**
     * 奖品规则ID
     */
    private Long ruleTreeId;
    /**
     * 排序
     */
    private Integer sort;
}
