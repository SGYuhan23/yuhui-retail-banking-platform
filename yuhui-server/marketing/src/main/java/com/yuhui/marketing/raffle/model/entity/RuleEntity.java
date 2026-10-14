package com.yuhui.marketing.raffle.model.entity;

import com.yuhui.types.common.Constants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**

 * 规则实体
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RuleEntity {
    /**
     * 抽奖策略ID
     */
    private Long id;

    /**
     * 奖品ID
     */
    private Long awardId;

    /**
     * 规则模型（rule_random - 随机值计算、rule_lock_n - 抽奖n次后解锁、rule_luck_award - 幸运奖(兜底奖品)）
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
     * 获取权重rule_weight 值
     * 数据案例；4000:102,103,104,105 5000:102,103,104,105,106,107
     */
    public Map<String, List<Long>> getRuleWeightValues() {
        if (!ruleModel.contains("rule_weight")) {
            return null;
        }
        String[] ruleValueGroups = ruleValue.split(Constants.SPACE);
        Map<String, List<Long>> resultMap = new HashMap<>();
        for (String ruleValueGroup : ruleValueGroups) {
            // 检查输入是否为空
            if (ruleValueGroup == null || ruleValueGroup.isEmpty()) {
                return resultMap;
            }
            // 分割字符串以获取键和值
            String[] parts = ruleValueGroup.split(Constants.COLON);
            if (parts.length != 2) {
                throw new IllegalArgumentException("rule_weight rule_rule invalid input format" + ruleValueGroup);
            }
            // 解析值
            String[] valueStrings = parts[1].split(Constants.SPLIT);
            List<Long> values = new ArrayList<>();
            for (String valueString : valueStrings) {
                values.add(Long.valueOf(valueString));
            }
            // 将键和值放入Map中
            resultMap.put(ruleValueGroup, values);
        }
        return resultMap;
    }
}
