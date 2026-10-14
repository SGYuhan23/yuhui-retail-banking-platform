package com.yuhui.marketing.raffle.service;

import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleWeightVO;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RaffleInventoryQueries implements Stock, Rule {
    @javax.annotation.Resource protected com.yuhui.marketing.raffle.repository.RaffleStock stock;

    private final StrategyRepository repository;
    public RaffleInventoryQueries(StrategyRepository repository) { this.repository = repository; }
    @Override
    public LotteryReqEntity takeQueueValue(String activityAward) {
        return stock.takeQueueValue(activityAward);
    }

    @Override
    public void updateActivityAwardStock(Long activityId, Long awardId) {
        stock.updateActivityAwardStock(activityId, awardId);
    }

    @Override
    public List<String> getActivityAwardList() {
        return stock.getActivityAwardList();
    }

    @Override
    public void clearAwardStock(String activityAward) {
        stock.clearAwardStock(activityAward);
    }

    @Override
    public void clearQueueValue(String activityAward) {
        stock.clearQueueValue(activityAward);
    }

    @Override
    public Map<Long, Integer> queryAwardRuleLockCount(Long[] treeIds) {
        return repository.queryAwardRuleLockCount(treeIds);
    }

    @Override
    public List<RuleWeightVO> queryStrategyRuleWeight(Long activityId) {
        return repository.queryStrategyRuleWeight(activityId);
    }
}

