package com.yuhui.trigger.api.dto.res;

import lombok.Data;

import java.util.Date;

/**
 * 规则树表
 *

 * @TableName rule_tree
 */
@Data
public class RuleTreeResponseDTO {

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

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

}