package com.yuhui.trigger.api.dto.req;

import lombok.Data;


@Data
public class RuleRequestDTO {

    private Long id;
    /**
     * 规则模型（rule_random - 随机值计算、rule_lock - 抽奖几次后解锁、rule_luck_award - 幸运奖(兜底奖品)）
     */
    private String ruleModel;
    /**
     * 规则比值
     */
    private String ruleValue;
    /**
     * 规则描述
     */
    private String ruleDesc;

}