package com.yuhui.trigger.api.dto.req;

import lombok.Data;

@Data
public class RuleTreeNodeLineRequestDTO {
    /**
     * 雪花ID
     */
    private Long id;

    /**
     * 规则树ID
     */
    private Long ruleTreeId;

    /**
     * From
     */
    private String ruleNodeFrom;

    /**
     * To
     */
    private String ruleNodeTo;

    /**
     * 限定类型；1:=;2:>;3:<;4:>=;5<=;6:enum[枚举范围];
     */
    private String ruleLimitType;

    /**
     * 限定值（到下个节点）
     */
    private String ruleLimitValue;

}