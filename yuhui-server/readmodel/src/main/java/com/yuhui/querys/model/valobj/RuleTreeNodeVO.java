package com.yuhui.querys.model.valobj;

import lombok.Data;

import java.util.Date;


@Data
public class RuleTreeNodeVO {
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

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

}