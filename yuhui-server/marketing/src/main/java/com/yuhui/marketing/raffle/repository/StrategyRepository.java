package com.yuhui.marketing.raffle.repository;

import com.yuhui.marketing.raffle.event.SendLotteryMessageEvent;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleWeightVO;
import com.yuhui.types.event.BaseEvent;

import java.util.List;
import java.util.Map;

/**

 * 策略领域仓储接口
 */
public interface StrategyRepository {

    List<StrategyAwardEntity> queryActivityAwardList(Long activityId);

    StrategyEntity queryStrategyEntityByStrategyId(Long strategyId);

    RuleEntity queryStrategyRule(String ruleWeight);

    String queryStrategyRuleValue(Long strategyId, Long awardId, String ruleModel);

    String queryStrategyRuleValue(Long strategyId, String ruleModel);

    StrategyAwardEntity queryActivityAwardEntity(Long activityId, Long awardId);

    Long queryStrategyIdByActivityId(Long activityId);

    Integer queryTodayUserLotteryCount(String userId, Long strategyId, Long activityId);

    Map<Long, Integer> queryAwardRuleLockCount(Long[] treeIds);

    List<RuleWeightVO> queryStrategyRuleWeight(Long activityId);

    void sendLotteryMessageToMq(String topic, BaseEvent.EventMessage<SendLotteryMessageEvent.LotteryMessage> eventMessage);

    String queryRuleValue(Long awardId);

    void deleteCacheKeyByStrategyId(Long strategyId);

    void deleteCacheKeyByActivityId(Long activityId);


    List<Long> queryActivityIdsByStrategyId(Long strategyId);
}
