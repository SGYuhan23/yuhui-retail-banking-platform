package com.yuhui.infrastructure.adapter.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.yuhui.marketing.raffle.event.SendLotteryMessageEvent;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.model.entity.StrategyEntity;
import com.yuhui.marketing.raffle.model.valobj.RuleWeightVO;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.event.EventPublisher;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import com.yuhui.types.event.BaseEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**

 * 策略领域仓储实现
 */
@Repository
@Slf4j
public class StrategyRepositoryImpl implements StrategyRepository {

    @Resource
    private AwardMapper awardMapper;

    @Resource
    private StrategyAwardMapper strategyAwardMapper;

    @Resource
    private RedisService redisService;

    @Resource
    private StrategyMapper strategyMapper;

    @Resource
    private ActivityAccountDayMapper activityAccountDayMapper;

    @Resource
    private ActivityMapper activityMapper;

    @Resource
    private RuleMapper ruleMapper;

    @Resource
    private RuleTreeNodeMapper ruleTreeNodeMapper;

    @Resource
    private EventPublisher eventPublisher;

    @Override
    public List<StrategyAwardEntity> queryActivityAwardList(Long activityId) {
        String cacheKey = Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY + activityId;
        List<StrategyAwardEntity> strategyAwardEntities = redisService.getValue(cacheKey);
        if (strategyAwardEntities != null && !strategyAwardEntities.isEmpty()) {
            return strategyAwardEntities;
        }

        LambdaQueryWrapper<StrategyAward> queryWrapper = new QueryWrapper<StrategyAward>()
                .lambda()
                .eq(StrategyAward::getActivityId, activityId);
        List<StrategyAward> strategyAwards = strategyAwardMapper.selectList(queryWrapper);
        if (strategyAwards == null || strategyAwards.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Long> awardIds = strategyAwards.stream().map(StrategyAward::getAwardId).collect(Collectors.toSet());
        List<Award> awards = awardIds.isEmpty() ? new ArrayList<>() : awardMapper.selectBatchIds(awardIds);
        for (Award award : awards) {
            redisService.setValue(Constants.RedisKey.AWARD_KEY + award.getId(), award);
        }
        Map<Long, String> awardMap = awards.stream().collect(Collectors.toMap(Award::getId, Award::getImage));

        strategyAwardEntities = new ArrayList<>(strategyAwards.size());
        for (StrategyAward strategyAward : strategyAwards) {
            StrategyAwardEntity strategyAwardEntity = new StrategyAwardEntity();
            BeanUtils.copyProperties(strategyAward, strategyAwardEntity);
            strategyAwardEntity.setImage(awardMap.get(strategyAward.getAwardId()));
            strategyAwardEntities.add(strategyAwardEntity);
        }
        redisService.setValue(cacheKey, strategyAwardEntities);
        return strategyAwardEntities;
    }

    @Override
    public StrategyEntity queryStrategyEntityByStrategyId(Long strategyId) {
        String cacheKey = Constants.RedisKey.STRATEGY_KEY + strategyId;
        StrategyEntity strategyEntity = redisService.getValue(cacheKey);
        if (strategyEntity != null) {
            return strategyEntity;
        }
        Strategy strategy = strategyMapper.selectOne(new QueryWrapper<Strategy>().lambda().eq(Strategy::getId, strategyId));
        if (strategy == null) {
            return null;
        }
        StrategyEntity newStrategyEntity = new StrategyEntity();
        BeanUtils.copyProperties(strategy, newStrategyEntity);
        redisService.setValue(cacheKey, newStrategyEntity);
        return newStrategyEntity;
    }

    @Override
    public RuleEntity queryStrategyRule(String ruleModel) {
        Rule rule = ruleMapper.selectOne(new QueryWrapper<Rule>().lambda().eq(Rule::getRuleModel, ruleModel));
        if (rule == null) {
            return null;
        }
        RuleEntity ruleEntity = new RuleEntity();
        BeanUtils.copyProperties(rule, ruleEntity);
        return ruleEntity;
    }

    @Override
    public String queryStrategyRuleValue(Long strategyId, Long awardId, String ruleModel) {
        Strategy strategy = new Strategy();
        String cacheKey = Constants.RedisKey.STRATEGY_KEY + strategyId;
        StrategyEntity strategyEntity = redisService.getValue(cacheKey);
        if (strategyEntity != null) {
            BeanUtils.copyProperties(strategyEntity, strategy);
        } else {
            strategy = strategyMapper.selectOne(new LambdaQueryWrapper<Strategy>().eq(Strategy::getId, strategyId));
            if (strategy == null || strategy.getRuleModels() == null) {
                return null;
            }
        }

        String[] split = strategy.getRuleModels().split(",");
        LambdaQueryWrapper<Rule> queryWrapper = null;
        for (String model : split) {
            if (model.contains(ruleModel)) {
                queryWrapper = new QueryWrapper<Rule>().lambda().eq(Rule::getRuleModel, model);
                break;
            }
        }
        if (queryWrapper == null) {
            return null;
        }
        Rule rule = ruleMapper.selectOne(queryWrapper);
        return rule == null ? null : rule.getRuleValue();
    }

    @Override
    public String queryStrategyRuleValue(Long strategyId, String ruleModel) {
        return queryStrategyRuleValue(strategyId, null, ruleModel);
    }

    @Override
    public StrategyAwardEntity queryActivityAwardEntity(Long activityId, Long awardId) {
        String cacheKey = Constants.RedisKey.ACTIVITY_AWARD_KEY + activityId + Constants.UNDERLINE + awardId;
        StrategyAwardEntity strategyAwardEntity = redisService.getValue(cacheKey);
        if (strategyAwardEntity == null) {
            StrategyAward strategyAwardRes = strategyAwardMapper.selectOne(new QueryWrapper<StrategyAward>().lambda()
                    .eq(StrategyAward::getActivityId, activityId)
                    .eq(StrategyAward::getAwardId, awardId));
            if (strategyAwardRes == null) {
                return null;
            }
            strategyAwardEntity = new StrategyAwardEntity();
            BeanUtils.copyProperties(strategyAwardRes, strategyAwardEntity);
            redisService.setValue(cacheKey, strategyAwardEntity);
        }

        String awardCacheKey = Constants.RedisKey.AWARD_KEY + awardId;
        Award award = redisService.getValue(awardCacheKey);
        if (award == null) {
            award = awardMapper.selectById(awardId);
            if (award != null) {
                redisService.setValue(awardCacheKey, award);
            }
        }
        if (award != null) {
            strategyAwardEntity.setAwardConfig(award.getAwardConfig());
        }
        return strategyAwardEntity;
    }

    @Override
    public Long queryStrategyIdByActivityId(Long activityId) {
        Activity activity = activityMapper.selectOne(new QueryWrapper<Activity>().lambda().eq(Activity::getId, activityId));
        return activity == null ? null : activity.getStrategyId();
    }

    @Override
    public Integer queryTodayUserLotteryCount(String userId, Long strategyId, Long activityId) {
        ActivityAccountDay activityAccountDay = new ActivityAccountDay();
        activityAccountDay.setUserId(userId);
        activityAccountDay.setActivityId(activityId);
        activityAccountDay.setDay(new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        ActivityAccountDay activityAccountDayRes = activityAccountDayMapper.queryActivityAccountDayByUserId(activityAccountDay);
        if (activityAccountDayRes == null) {
            return 0;
        }
        return activityAccountDayRes.getDayCount() - activityAccountDayRes.getDayCountSurplus();
    }

    @Override
    public Map<Long, Integer> queryAwardRuleLockCount(Long[] treeIds) {
        if (treeIds == null || treeIds.length == 0) {
            return new HashMap<>();
        }
        List<RuleTreeNode> ruleTreeNodes = ruleTreeNodeMapper.selectList(new QueryWrapper<RuleTreeNode>().lambda()
                .eq(RuleTreeNode::getRuleName, Constants.RuleModel.RULE_LOCK)
                .in(RuleTreeNode::getRuleTreeId, Arrays.asList(treeIds)));
        Map<Long, Integer> map = new HashMap<>();
        for (RuleTreeNode ruleTreeNode : ruleTreeNodes) {
            map.put(ruleTreeNode.getRuleTreeId(), Integer.valueOf(ruleTreeNode.getRuleValue()));
        }
        return map;
    }

    @Override
    public List<RuleWeightVO> queryStrategyRuleWeight(Long activityId) {
        String cacheKey = Constants.RedisKey.ACTIVITY_RULE_WEIGHT_KEY + activityId;
        List<RuleWeightVO> ruleWeightVOList = redisService.getValue(cacheKey);
        if (ruleWeightVOList != null) {
            return ruleWeightVOList;
        }

        Long strategyId = queryStrategyIdByActivityId(activityId);
        StrategyEntity strategyEntity = queryStrategyEntityByStrategyId(strategyId);
        if (strategyEntity == null || strategyEntity.getRuleWeight() == null) {
            return new ArrayList<>();
        }

        Rule rule = ruleMapper.selectOne(new QueryWrapper<Rule>().lambda().eq(Rule::getRuleModel, strategyEntity.getRuleWeight()));
        if (rule == null) {
            return new ArrayList<>();
        }

        RuleEntity ruleEntity = new RuleEntity();
        ruleEntity.setRuleModel(strategyEntity.getRuleWeight());
        ruleEntity.setRuleValue(rule.getRuleValue());
        Map<String, List<Long>> ruleWeightValues = ruleEntity.getRuleWeightValues();

        List<RuleWeightVO> newRuleWeightVOList = new ArrayList<>();
        for (String ruleWeightKey : ruleWeightValues.keySet()) {
            List<Long> awardIds = ruleWeightValues.get(ruleWeightKey);
            List<RuleWeightVO.Award> awardList = new ArrayList<>();
            for (Long awardId : awardIds) {
                StrategyAward strategyAward = strategyAwardMapper.selectOne(new QueryWrapper<StrategyAward>().lambda()
                        .eq(StrategyAward::getActivityId, activityId)
                        .eq(StrategyAward::getAwardId, awardId));
                if (strategyAward == null) {
                    continue;
                }
                awardList.add(RuleWeightVO.Award.builder()
                        .awardId(awardId)
                        .awardTitle(strategyAward.getAwardTitle())
                        .build());
            }
            newRuleWeightVOList.add(RuleWeightVO.builder()
                    .ruleValue(rule.getRuleValue())
                    .awardIds(awardIds)
                    .awardList(awardList)
                    .weight(Integer.valueOf(ruleWeightKey.split(Constants.COLON)[0]))
                    .build());
        }

        redisService.setValue(cacheKey, newRuleWeightVOList);
        return newRuleWeightVOList;
    }

    @Override
    public void sendLotteryMessageToMq(String topic, BaseEvent.EventMessage<SendLotteryMessageEvent.LotteryMessage> message) {
        try {
            eventPublisher.publish(topic, message);
        } catch (Exception e) {
            log.error("send lottery message failed userId:{} topic:{}", message.getData().getUserId(), topic, e);
        }
    }

    @Override
    public String queryRuleValue(Long awardId) {
        Award award = awardMapper.selectOne(new LambdaQueryWrapper<Award>().eq(Award::getId, awardId));
        return award == null ? null : award.getAwardConfig();
    }

    @Override
    public void deleteCacheKeyByStrategyId(Long strategyId) {
        redisService.deleteKeysWithPattern(Constants.RedisKey.STRATEGY_KEY + strategyId);
    }

    @Override
    public void deleteCacheKeyByActivityId(Long activityId) {
        redisService.deleteKeysWithPattern(activityId.toString());
        redisService.remove(Constants.RedisKey.ACTIVITY_RULE_WEIGHT_KEY + activityId);
    }

    @Override
    public List<Long> queryActivityIdsByStrategyId(Long strategyId) {
        List<Activity> activities = activityMapper.selectList(new QueryWrapper<Activity>().lambda()
                .eq(Activity::getStrategyId, strategyId));
        return activities.stream().map(Activity::getId).toList();
    }
}
