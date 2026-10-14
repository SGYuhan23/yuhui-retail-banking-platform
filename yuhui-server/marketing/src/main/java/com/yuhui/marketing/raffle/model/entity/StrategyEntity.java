package com.yuhui.marketing.raffle.model.entity;

import com.yuhui.types.common.Constants;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

/**

 * 策略实体
 */
@Data
public class StrategyEntity {
    /**
     * 抽奖策略ID
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

    /**
     * 获取每一个规则模型
     *
     * @return 数组
     */
    public String[] ruleModels() {
        if (StringUtils.isBlank(ruleModels)) {
            return null;
        }
        return ruleModels.split(Constants.SPLIT);
    }

    /**
     * 获取权重模型(带rule_weight的)
     *
     * @return String
     */
    public String getRuleWeight() {
        String[] ruleModels = this.ruleModels();
        if (ruleModels == null){
            return null;
        }
        for (String ruleModel : ruleModels) {
            if (ruleModel.contains(Constants.RuleModel.RULE_WIGHT)) {
                return ruleModel;
            }
        }
        return null;
    }
}
