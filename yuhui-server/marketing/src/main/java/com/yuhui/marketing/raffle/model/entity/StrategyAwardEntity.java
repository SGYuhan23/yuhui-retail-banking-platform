package com.yuhui.marketing.raffle.model.entity;

import lombok.Data;

import java.math.BigDecimal;

/**

 * 策略_奖品实体
 */
@Data
public class StrategyAwardEntity {
    private Long activityId;
    private Long awardId;
    private String awardTitle;
    private String awardSubtitle;
    private String image;
    private Integer awardCount;
    private Integer awardCountSurplus;
    private BigDecimal awardRate;
    private Long ruleTreeId;
    private String awardConfig;
    private Integer sort;
}
