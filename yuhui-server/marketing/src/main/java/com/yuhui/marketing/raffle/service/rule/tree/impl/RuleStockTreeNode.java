package com.yuhui.marketing.raffle.service.rule.tree.impl;

import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleLogicCheckTypeVO;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.service.armory.StrategyService;
import com.yuhui.marketing.raffle.service.rule.tree.LogicTree;
import com.yuhui.marketing.raffle.service.rule.tree.factory.DefaultLogicTreeFactory;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**

 * 规则树-库存扣减节点
 */
@Component(Constants.RuleModel.RULE_STOCK)
@Slf4j
public class RuleStockTreeNode implements LogicTree {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleStock stock;


    @Resource
    private StrategyService strategyService;
    @Resource
    private StrategyRepository repository;

    @Override
    public DefaultLogicTreeFactory.TreeActionEntity logic(String userId, Long strategyId, Long activityId, Long awardId, String ruleValue) {
        log.info("【规则树 RuleStockTreeNode-库存扣减节点开始执行】");
        // 扣减库存
        Boolean result = strategyService.reduceAwardStock(activityId, awardId);
        // 扣减成功，放行
        if (result) {
            log.info("【规则树 RuleStockTreeNode】-库存扣减-成功-放行 userId:{} strategyId:{} awardId:{}", userId, strategyId, awardId);
            // 写入延迟队列，延迟消费 更新数据库记录
            stock.awardStockConsumeSendQueue(LotteryReqEntity.builder()
                    .strategyId(strategyId)
                    .activityId(activityId)
                    .awardId(awardId)
                    .build());
            return DefaultLogicTreeFactory.TreeActionEntity.builder()
                    .ruleLogicCheckType(RuleLogicCheckTypeVO.ALLOW)
                    .ruleEntity(RuleEntity.builder()
                            .awardId(awardId)
                            .ruleValue(ruleValue)
                            .build())
                    .build();
        }
        // 否则拦截
        log.info("【规则树 RuleStockTreeNode】-库存扣减-失败-拦截 userId:{} strategyId:{} activityId:{} awardId:{}", userId, strategyId, activityId, awardId);
        return DefaultLogicTreeFactory.TreeActionEntity.builder()
                .ruleLogicCheckType(RuleLogicCheckTypeVO.TAKE_OVER)
                .build();
    }
}
