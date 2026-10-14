package com.yuhui.marketing.raffle.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**

 * 规则树-节点
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RuleTreeNodeVO {
    /** 规则树ID */
    private Long ruleTreeId;
    /** 规则名 */
    private String ruleName;
    /** 规则描述 */
    private String ruleDesc;
    /** 规则的值 */
    private String ruleValue;
    /** 规则走向 */
    private List<RuleTreeNodeLineVO> treeNodeLineVOList;
}
