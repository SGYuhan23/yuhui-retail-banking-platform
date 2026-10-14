package com.yuhui.test.domain.strategy;

import com.alibaba.fastjson.JSON;
import com.yuhui.marketing.raffle.model.entity.LotteryReqEntity;
import com.yuhui.marketing.raffle.model.entity.LotteryResEntity;
import com.yuhui.marketing.raffle.service.Lottery;
import com.yuhui.marketing.raffle.service.rule.chain.impl.RuleWeightLogicChain;
import com.yuhui.marketing.raffle.service.rule.tree.impl.RuleLockTreeNode;
import com.yuhui.marketing.raffle.service.armory.StrategyArmory;
import com.yuhui.infrastructure.redis.RedisServiceImpl;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import javax.annotation.Resource;
import java.util.concurrent.CountDownLatch;

@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
public class LotteryTest {
    @Resource
    private Lottery lottery;
    @Resource
    private RuleWeightLogicChain ruleWeightLogicChain;
    @Resource
    private RuleLockTreeNode ruleLockTreeNode;
    @Resource
    private RedisServiceImpl redisService;
    @Resource
    private StrategyArmory strategyArmory;

    @Before
    public void setUp() {
        // 通过反射 mock 规则中的值
        ReflectionTestUtils.setField(ruleWeightLogicChain, "userScore", 5050L);
        ReflectionTestUtils.setField(ruleLockTreeNode, "userLotteryCount", 10L);
    }

    /**
     * 抽奖策略装配
     */
    @Test
    public void test_strategyArmory() {
        // 因为实际操作是更新数据库时，更新redis。这里装配抽奖策略时有部分参数是从原先redis缓存中获取的，测试先手动清空redis便于调试
        String cacheKey = Constants.RedisKey.STRATEGY_AWARD_LIST_KEY + 200001;
        String cacheKey2 = Constants.RedisKey.STRATEGY_KEY + 200001;
        String cacheKey3 = Constants.RedisKey.RATE_RANGE_KEY + 200001;
        String cacheKey4 = Constants.RedisKey.RATE_TABLE_KEY + 200001;
        redisService.remove(cacheKey);
        redisService.remove(cacheKey2);
        redisService.remove(cacheKey3);
        redisService.remove(cacheKey4);
        boolean success4 = strategyArmory.assembleLotteryStrategy(200001L);
        log.info("测试结果4：{}", success4);
    }

    /**
     * 执行抽奖
     */
    @Test
    public void test_lottery() throws InterruptedException {
        for (int i = 0; i < 1; i++) {
            LotteryReqEntity lotteryReqEntity = LotteryReqEntity.builder()
                    .userId("user010")
                    .strategyId(200001L)
                    .build();
            LotteryResEntity lotteryResEntity = lottery.doLottery(lotteryReqEntity);
            log.info("请求参数：{}", JSON.toJSONString(lotteryReqEntity));
            log.info("测试结果：{}", JSON.toJSONString(lotteryResEntity));
        }
        // 等待 UpdateAwardStockJob 消费队列
        new CountDownLatch(1).await();
    }
}
