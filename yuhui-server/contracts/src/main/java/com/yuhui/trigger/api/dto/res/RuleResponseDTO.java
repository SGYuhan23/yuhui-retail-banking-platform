package com.yuhui.trigger.api.dto.res;

import lombok.Data;

import java.util.Date;


@Data
public class RuleResponseDTO {

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
    /**
     * 创建时间
     */
    private Date createTime;
    /**
     * 更新时间
     */
    private Date updateTime;
}