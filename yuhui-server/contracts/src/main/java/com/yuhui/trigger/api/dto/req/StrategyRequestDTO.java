package com.yuhui.trigger.api.dto.req;

import lombok.Data;


@Data
public class StrategyRequestDTO {
    /**
     * 雪花ID
     */
    private Long id;

    /**
     * 抽奖策略描述
     */
    private String strategyDesc;
    /**
     * 规则模型
     */
    private String ruleModels;

}