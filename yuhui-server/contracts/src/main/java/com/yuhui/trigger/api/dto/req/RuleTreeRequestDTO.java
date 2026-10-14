package com.yuhui.trigger.api.dto.req;

import lombok.Data;

/**
 * 规则树表
 *

 * @TableName rule_tree
 */
@Data
public class RuleTreeRequestDTO {

    private Long id;

    /**
     * 规则树名称
     */
    private String treeName;

    /**
     * 规则树描述
     */
    private String treeDesc;

    /**
     * 规则树根入口规则
     */
    private String treeNodeRuleKey;

}