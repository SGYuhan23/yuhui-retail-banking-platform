package com.yuhui.trigger.api.dto.req;

import lombok.Data;


@Data
public class RuleTreeNodeRequestDTO {
    /**
     * 雪花ID
     */
    private Long id;

    /**
     * 规则树ID
     */
    private Long ruleTreeId;

    /**
     * 规则名
     */
    private String ruleName;

    /**
     * 规则描述
     */
    private String ruleDesc;

    /**
     * 规则的值
     */
    private String ruleValue;


}