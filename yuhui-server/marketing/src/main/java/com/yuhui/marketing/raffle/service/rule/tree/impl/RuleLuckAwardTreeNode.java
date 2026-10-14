package com.yuhui.marketing.raffle.service.rule.tree.impl;

import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleLogicCheckTypeVO;
import com.yuhui.marketing.raffle.service.rule.tree.LogicTree;
import com.yuhui.marketing.raffle.service.rule.tree.factory.DefaultLogicTreeFactory;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**

 * 规则树-幸运（兜底）奖节点
 */
@Component(Constants.RuleModel.RULE_LUCK_AWARD)
@Slf4j
public class RuleLuckAwardTreeNode implements LogicTree {
    @Override
    public DefaultLogicTreeFactory.TreeActionEntity logic(String userId, Long strategyId,Long activityId, Long awardId, String ruleValue) {
        log.info("【规则树 RuleLuckAwardTreeNode-兜底奖节点开始执行】");
        // 返回兜底奖品
        log.info("【规则树 RuleLuckAwardTreeNode】-兜底奖品'谢谢参与' userId:{} strategyId:{}", userId, strategyId);
        return DefaultLogicTreeFactory.TreeActionEntity.builder()
                .ruleLogicCheckType(RuleLogicCheckTypeVO.TAKE_OVER)
                .ruleEntity(RuleEntity.builder()
                        .awardId(1989337068971188225L)
                        .ruleValue("谢谢参与")
                        .build())
                .build();
    }
}
