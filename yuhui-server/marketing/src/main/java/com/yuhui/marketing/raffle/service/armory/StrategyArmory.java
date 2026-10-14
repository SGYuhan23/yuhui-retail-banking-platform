package com.yuhui.marketing.raffle.service.armory;

/**

 * 策略-装配领域-装配接口
 */
public interface StrategyArmory {

    /**
     * 装配抽奖策略「可在创建/变更策略时调用」
     *
     * @param strategyId 策略ID
     * @return t/f
     */
    boolean assembleLotteryStrategy(Long strategyId);


    /**
     * 装配抽奖策略「可在创建/变更策略时调用」
     *
     * @param activityId 活动ID
     * @return t/f
     */
    boolean assembleLotteryStrategyByActivityId(Long activityId);

}
