package com.yuhui.infrastructure.adapter.repository;


import cn.bugstack.middleware.db.router.strategy.IDBRouterStrategy;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yuhui.marketing.reward.behavior.model.valobj.BehaviorTypeVO;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.event.EventPublisher;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.*;
import com.yuhui.types.common.Constants;
import com.yuhui.types.model.MyPage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@Slf4j
public class ErpRepositoryImpl implements ErpRepository {
    @Resource
    private ActivityMapper activityMapper;
    @Resource
    private ActivityCountMapper activityCountMapper;
    @Resource
    private ActivitySkuMapper activitySkuMapper;
    @Resource
    private BehaviorRebateMapper behaviorRebateMapper;
    @Resource
    private AwardMapper awardMapper;
    @Resource
    private StrategyMapper strategyMapper;
    @Resource
    private RuleMapper ruleMapper;
    @Resource
    private StrategyAwardMapper strategyAwardMapper;
    @Resource
    private RuleTreeMapper ruleTreeMapper;
    @Resource
    private RuleTreeNodeMapper ruleTreeNodeMapper;
    @Resource
    private RuleTreeNodeLineMapper ruleTreeNodeLineMapper;
    @Resource
    private RedisService redisService;
    @Resource
    private UserAwardRecordMapper userAwardRecordMapper;
    @Resource
    private IDBRouterStrategy dbRouter;
    @Resource
    private EventPublisher eventPublisher;
    @Value("${spring.rabbitmq.topic.delete_keys_with_prefix}")
    private String topic;

    @Override
    public List<ActivityVO> queryActivityVOList() {
        List<Activity> activities = activityMapper.selectList(null);
        activities.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        List<ActivityVO> list = com.yuhui.types.model.BeanProjection.list(activities, ActivityVO::new);
        return list;
    }

    @Override
    public void addActivityVO(ActivityVO activityVO) {
        Activity activity = new Activity();
        BeanUtils.copyProperties(activityVO, activity);
        activityMapper.insert(activity);
        activityVO.setId(activity.getId());
    }

    @Override
    public void updateActivityVO(ActivityVO activityVO) {
        Activity activity = new Activity();
        BeanUtils.copyProperties(activityVO, activity);
        activityMapper.updateById(activity);
    }

    @Override
    public void deleteActivityVO(Long activityId) {
        activityMapper.deleteById(activityId);
    }

    @Override
    public List<ActivityCountVO> queryActivityCountVOList() {
        List<ActivityCount> activityCounts = activityCountMapper.selectList(null);
        activityCounts.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        List<ActivityCountVO> list = com.yuhui.types.model.BeanProjection.list(activityCounts, ActivityCountVO::new);
        return list;
    }

    @Override
    public void addActivityCountVO(ActivityCountVO activityCountVO) {
        ActivityCount activityCount = new ActivityCount();
        BeanUtils.copyProperties(activityCountVO, activityCount);
        activityCountMapper.insert(activityCount);
    }

    @Override
    public void updateActivityCountVO(ActivityCountVO activityCountVO) {
        ActivityCount activityCount = new ActivityCount();
        BeanUtils.copyProperties(activityCountVO, activityCount);
        activityCountMapper.updateById(activityCount);
    }

    @Override
    public void deleteActivityCountVO(Long activityCountId) {
        activityCountMapper.deleteById(activityCountId);
    }

    @Override
    public List<ActivitySkuVO> queryActivitySkuVOList() {
        List<ActivitySku> activitySkus = activitySkuMapper.selectList(null);
        activitySkus.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        List<ActivitySkuVO> list = com.yuhui.types.model.BeanProjection.list(activitySkus, ActivitySkuVO::new);
        return list;
    }

    @Override
    public void addActivitySkuVO(ActivitySkuVO activitySkuVO) {
        ActivitySku activitySku = new ActivitySku();
        BeanUtils.copyProperties(activitySkuVO, activitySku);
        activitySkuMapper.insert(activitySku);
    }

    @Override
    public void updateActivitySkuVO(ActivitySkuVO activitySkuVO) {
        ActivitySku activitySku = new ActivitySku();
        BeanUtils.copyProperties(activitySkuVO, activitySku);
        activitySkuMapper.updateById(activitySku);
    }

    @Override
    public void deleteActivitySkuVO(Long activitySkuId) {
        activitySkuMapper.deleteById(activitySkuId);
    }

    @Override
    public List<BehaviorRebateVO> queryBehaviorRebateVOList() {
        List<BehaviorRebate> behaviorRebates = behaviorRebateMapper.selectList(null);
        behaviorRebates.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        List<BehaviorRebateVO> list = com.yuhui.types.model.BeanProjection.list(behaviorRebates, BehaviorRebateVO::new);
        return list;
    }

    @Override
    public List<BehaviorRebateVO> queryBehaviorRebateVOListOfGift(Long activityId) {
        LambdaQueryWrapper<BehaviorRebate> queryWrapper = new LambdaQueryWrapper<BehaviorRebate>().eq(BehaviorRebate::getActivityId, activityId).eq(BehaviorRebate::getBehaviorType, BehaviorTypeVO.ACTIVITY_GIFT.getCode());
        List<BehaviorRebate> behaviorRebates = behaviorRebateMapper.selectList(queryWrapper);
        behaviorRebates.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        List<BehaviorRebateVO> list = com.yuhui.types.model.BeanProjection.list(behaviorRebates, BehaviorRebateVO::new);
        return list;
    }

    @Override
    public void addBehaviorRebateVO(BehaviorRebateVO behaviorRebateVO) {
        BehaviorRebate behaviorRebate = new BehaviorRebate();
        BeanUtils.copyProperties(behaviorRebateVO, behaviorRebate);
        behaviorRebateMapper.insert(behaviorRebate);
    }

    @Override
    public void updateBehaviorRebateVO(BehaviorRebateVO behaviorRebateVO) {
        BehaviorRebate behaviorRebate = new BehaviorRebate();
        BeanUtils.copyProperties(behaviorRebateVO, behaviorRebate);
        behaviorRebateMapper.updateById(behaviorRebate);
    }

    @Override
    public void deleteBehaviorRebateVO(Long behaviorRebateId) {
        behaviorRebateMapper.deleteById(behaviorRebateId);
    }

    @Override
    public List<AwardResponseVO> queryAwardVOList() {
        List<Award> awards = awardMapper.queryAwardList();
        return awards.stream().map(award -> {
            AwardResponseVO awardResponseVO = new AwardResponseVO();
            BeanUtils.copyProperties(award, awardResponseVO);
            return awardResponseVO;
        }).toList();
    }

    @Override
    public void addAwardVO(AwardResponseVO awardResponseVO) {
        Award award = new Award();
        BeanUtils.copyProperties(awardResponseVO, award);
        awardMapper.insert(award);
    }

    @Override
    public void updateAwardVO(AwardResponseVO awardResponseVO) {
        Award award = new Award();
        BeanUtils.copyProperties(awardResponseVO, award);
        awardMapper.updateById(award);
//        //发送mq消息,删除所有以lottery_strategy_award_list_key_和lottery_strategy_award_key_开头的redis key
//        String strategyAwardListKey = Constants.RedisKey.STRATEGY_AWARD_LIST_KEY;
//        String strategyAwardKey = Constants.RedisKey.STRATEGY_AWARD_KEY;
//        try {
//            eventPublisher.publish(topic, strategyAwardListKey);
//            eventPublisher.publish(topic, strategyAwardKey);
//            log.debug("[ErpRepositoryImpl]删除缓存key，MQ消息发送成功 key_prefix: {} and {} topic: {}",strategyAwardListKey,strategyAwardKey, topic);
//        } catch (Exception e) {
//            log.error("[ErpRepositoryImpl]删除缓存key，MQ消息发送失败 key_prefix: {} and {} topic: {}",strategyAwardListKey,strategyAwardKey, topic);
//        }
    }

    @Override
    public void deleteAwardVO(Long awardId) {
        awardMapper.deleteById(awardId);
    }

    @Override
    public List<StrategyVO> queryStrategyVOList() {
        List<Strategy> strategies = strategyMapper.selectList(null);
        strategies.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        return strategies.stream().map(strategy -> {
            StrategyVO strategyVO = new StrategyVO();
            BeanUtils.copyProperties(strategy, strategyVO);
            return strategyVO;
        }).toList();
    }

    @Override
    public void addStrategyVO(StrategyVO strategyVO) {
        Strategy strategy = new Strategy();
        BeanUtils.copyProperties(strategyVO, strategy);
        strategyMapper.insert(strategy);
    }

    @Override
    public void updateStrategyVO(StrategyVO strategyVO) {
        Strategy strategy = new Strategy();
        BeanUtils.copyProperties(strategyVO, strategy);
        strategyMapper.updateById(strategy);
    }

    @Override
    public void deleteStrategyVO(Long strategyId) {
        strategyMapper.deleteById(strategyId);
        // 删除该策略算法的缓存,如 strategy_algorithm_1947130468034007042
        String key = Constants.RedisKey.STRATEGY_ALGORITHM_KEY + strategyId;
        redisService.remove(key);
    }

    @Override
    public List<RuleVO> queryRuleVOList() {
        List<Rule> rules = ruleMapper.selectList(null);
        // 按更新时间倒序
        rules.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        return rules.stream().map(rule -> {
            RuleVO ruleVO = new RuleVO();
            BeanUtils.copyProperties(rule, ruleVO);
            return ruleVO;
        }).toList();
    }

    @Override
    public void addRuleVO(RuleVO ruleVO) {
        Rule rule = new Rule();
        BeanUtils.copyProperties(ruleVO, rule);
        ruleMapper.insert(rule);
    }

    @Override
    public void updateRuleVO(RuleVO ruleVO) {
        Rule rule = new Rule();
        BeanUtils.copyProperties(ruleVO, rule);
        ruleMapper.updateById(rule);
        //发送mq消息,删除所有以lottery_strategy_rule_weight_key_开头的redis key
//        String strategyRuleWeightKey = Constants.RedisKey.STRATEGY_RULE_WEIGHT_KEY;
//        try {
//            eventPublisher.publish(topic, strategyRuleWeightKey);
//            log.debug("[ErpRepositoryImpl]删除缓存key，MQ消息发送成功 key_prefix: {} topic: {}", strategyRuleWeightKey, topic);
//        } catch (Exception e) {
//            log.error("[ErpRepositoryImpl]删除缓存key，MQ消息发送失败 key_prefix: {} topic: {}", strategyRuleWeightKey, topic);
//        }
    }

    @Override
    public void deleteRuleVO(Long ruleId) {
        ruleMapper.deleteById(ruleId);
    }

    @Override
    public List<StrategyAwardVO> queryStrategyAwardVOList() {
        List<StrategyAward> strategyAwards = strategyAwardMapper.selectList(null);
        strategyAwards.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        return strategyAwards.stream().map(strategyAward -> {
            StrategyAwardVO strategyAwardVO = new StrategyAwardVO();
            BeanUtils.copyProperties(strategyAward, strategyAwardVO);
            return strategyAwardVO;
        }).toList();
    }

    @Override
    public void addStrategyAwardVO(StrategyAwardVO strategyAwardVO) {
        StrategyAward strategyAward = new StrategyAward();
        BeanUtils.copyProperties(strategyAwardVO, strategyAward);
        strategyAwardMapper.insert(strategyAward);
    }

    @Override
    public void updateStrategyAwardVO(StrategyAwardVO strategyAwardVO) {
        StrategyAward strategyAward = new StrategyAward();
        BeanUtils.copyProperties(strategyAwardVO, strategyAward);
        strategyAwardMapper.updateById(strategyAward);
        //发送mq消息,删除所有以lottery_strategy_award_list_key_开头的redis key
//        String strategyAwardListKey = Constants.RedisKey.STRATEGY_AWARD_LIST_KEY;
//        try {
//            eventPublisher.publish(topic, strategyAwardListKey);
//            log.debug("[ErpRepositoryImpl]删除缓存key，MQ消息发送成功 key_prefix: {} topic: {}", strategyAwardListKey, topic);
//        } catch (Exception e) {
//            log.error("[ErpRepositoryImpl]删除缓存key，MQ消息发送失败 key_prefix: {} topic: {}", strategyAwardListKey, topic);
//        }
    }

    @Override
    public void deleteStrategyAwardVO(Long strategyAwardId) {
        strategyAwardMapper.deleteById(strategyAwardId);
    }

    @Override
    public List<RuleTreeVO> queryRuleTreeVOList() {
        List<RuleTree> ruleTrees = ruleTreeMapper.selectList(null);
        ruleTrees.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        return ruleTrees.stream().map(ruleTree -> {
            RuleTreeVO ruleTreeVO = new RuleTreeVO();
            BeanUtils.copyProperties(ruleTree, ruleTreeVO);
            return ruleTreeVO;
        }).toList();
    }

    @Override
    public void addRuleTreeVO(RuleTreeVO ruleTreeVO) {
        RuleTree ruleTree = new RuleTree();
        BeanUtils.copyProperties(ruleTreeVO, ruleTree);
        ruleTreeMapper.insert(ruleTree);
    }

    @Override
    public void updateRuleTreeVO(RuleTreeVO ruleTreeVO) {
        RuleTree ruleTree = new RuleTree();
        BeanUtils.copyProperties(ruleTreeVO, ruleTree);
        ruleTreeMapper.updateById(ruleTree);
    }

    @Override
    public void deleteRuleTreeVO(Long ruleTreeId) {
        ruleTreeMapper.deleteById(ruleTreeId);
    }

    @Override
    public List<RuleTreeNodeVO> queryRuleTreeNodeVO() {
        List<RuleTreeNode> ruleTreeNodes = ruleTreeNodeMapper.selectList(null);
        ruleTreeNodes.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        return ruleTreeNodes.stream().map(ruleTreeNode -> {
            RuleTreeNodeVO ruleTreeNodeVO = new RuleTreeNodeVO();
            BeanUtils.copyProperties(ruleTreeNode, ruleTreeNodeVO);
            return ruleTreeNodeVO;
        }).toList();
    }

    @Override
    public void addRuleTreeNodeVO(RuleTreeNodeVO ruleTreeNodeVO) {
        RuleTreeNode ruleTreeNode = new RuleTreeNode();
        BeanUtils.copyProperties(ruleTreeNodeVO, ruleTreeNode);
        ruleTreeNodeMapper.insert(ruleTreeNode);
    }

    @Override
    public void updateRuleTreeNodeVO(RuleTreeNodeVO ruleTreeNodeVO) {
        RuleTreeNode ruleTreeNode = new RuleTreeNode();
        BeanUtils.copyProperties(ruleTreeNodeVO, ruleTreeNode);
        ruleTreeNodeMapper.updateById(ruleTreeNode);
    }

    @Override
    public void deleteRuleTreeNodeVO(Long ruleTreeNodeId) {
        ruleTreeNodeMapper.deleteById(ruleTreeNodeId);
    }

    @Override
    public List<RuleTreeNodeLineVO> queryRuleTreeNodeLineVO() {
        List<RuleTreeNodeLine> ruleTreeNodeLines = ruleTreeNodeLineMapper.selectList(null);
        ruleTreeNodeLines.sort((o1, o2) -> o2.getUpdateTime().compareTo(o1.getUpdateTime()));
        return ruleTreeNodeLines.stream().map(ruleTreeNodeLine -> {
            RuleTreeNodeLineVO ruleTreeNodeLineVO = new RuleTreeNodeLineVO();
            BeanUtils.copyProperties(ruleTreeNodeLine, ruleTreeNodeLineVO);
            return ruleTreeNodeLineVO;
        }).toList();
    }

    @Override
    public void addRuleTreeNodeLineVO(RuleTreeNodeLineVO ruleTreeNodeLineVO) {
        RuleTreeNodeLine ruleTreeNodeLine = new RuleTreeNodeLine();
        BeanUtils.copyProperties(ruleTreeNodeLineVO, ruleTreeNodeLine);
        ruleTreeNodeLineMapper.insert(ruleTreeNodeLine);
    }

    @Override
    public void updateRuleTreeNodeLineVO(RuleTreeNodeLineVO ruleTreeNodeLineVO) {
        RuleTreeNodeLine ruleTreeNodeLine = new RuleTreeNodeLine();
        BeanUtils.copyProperties(ruleTreeNodeLineVO, ruleTreeNodeLine);
        ruleTreeNodeLineMapper.updateById(ruleTreeNodeLine);
    }

    @Override
    public void deleteRuleTreeNodeLineVO(Long ruleTreeNodeLineId) {
        ruleTreeNodeLineMapper.deleteById(ruleTreeNodeLineId);
    }

    @Override
    public List<RuleTreeNodeVO> queryRuleTreeNodeVOByRuleTreeId(String ruleTreeId) {
        LambdaQueryWrapper<RuleTreeNode> queryWrapper = new LambdaQueryWrapper<RuleTreeNode>().eq(RuleTreeNode::getRuleTreeId, ruleTreeId);
        List<RuleTreeNode> ruleTreeNodes = ruleTreeNodeMapper.selectList(queryWrapper);
        return ruleTreeNodes.stream().map(ruleTreeNodeLine -> {
            RuleTreeNodeVO ruleTreeNodeVO = new RuleTreeNodeVO();
            BeanUtils.copyProperties(ruleTreeNodeLine, ruleTreeNodeVO);
            return ruleTreeNodeVO;
        }).toList();
    }

    @Override
    public MyPage<UserAwardRecordVO> queryUserAwardRecordVOListByPage(Integer pageNum, Integer pageSize, Long activityId, String userId) {
        // 根据中奖时间倒序排序
        LambdaQueryWrapper<UserAwardRecord> queryWrapper = new LambdaQueryWrapper<UserAwardRecord>().orderByDesc(UserAwardRecord::getAwardTime);
        queryWrapper.eq(UserAwardRecord::getUserId, userId);
        queryWrapper.eq(UserAwardRecord::getActivityId, activityId);
        Page<UserAwardRecord> page = new Page<>(pageNum, pageSize);
        MyPage<UserAwardRecordVO> myPage = new MyPage<>();
        Page<UserAwardRecord> userAwardRecordPage=null;
        try {
            dbRouter.doRouter(userId);
            userAwardRecordPage = userAwardRecordMapper.selectPage(page, queryWrapper);
        } finally {
            dbRouter.clear();
        }
        if (userAwardRecordPage.getRecords().isEmpty()){
            return myPage;
        }
        String key = Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY + activityId;
        if (!redisService.isExists(key)){
            //如果key不存在，查数据库
            LambdaQueryWrapper<StrategyAward> strategyAwardQueryWrapper = new QueryWrapper<StrategyAward>()
                    .lambda()
                    .eq(StrategyAward::getActivityId, activityId);
            List<StrategyAward> strategyAwards = strategyAwardMapper.selectList(strategyAwardQueryWrapper);
            if (strategyAwards == null || strategyAwards.isEmpty()) {
                redisService.setValue(key, new ArrayList<StrategyAwardEntity>());
                return myPage;
            }
            // 提取出strategyAwards中所有的awardId
            Set<Long> awardIds = strategyAwards.stream().map(StrategyAward::getAwardId).collect(Collectors.toSet());
            if (awardIds.isEmpty()) {
                redisService.setValue(key, new ArrayList<StrategyAwardEntity>());
                return myPage;
            }
            // 批量查询数据库
            List<Award> awards = awardMapper.selectBatchIds(awardIds);
            // 放到map集合中 awardId为key image为value
            Map<Long, String> awardMap = awards.stream().collect(Collectors.toMap(Award::getId, Award::getImage));
            ArrayList<StrategyAwardEntity> strategyAwardEntities = new ArrayList<>(strategyAwards.size());
            //StrategyAward->StrategyAwardEntity
            for (StrategyAward strategyAward : strategyAwards) {
                StrategyAwardEntity strategyAwardEntity = new StrategyAwardEntity();
                BeanUtils.copyProperties(strategyAward, strategyAwardEntity);
                // image 从Map中取出
                strategyAwardEntity.setImage(awardMap.get(strategyAward.getAwardId()));
                strategyAwardEntities.add(strategyAwardEntity);
            }
            //保存到redis中
            redisService.setValue(key, strategyAwardEntities);
        }
        ArrayList<StrategyAwardEntity> arrayList = redisService.getValue(key);
        // 将所有数据 awardId 作为键 image 作为值封装为一个map集合
        Map<Long, String> awardMap = arrayList.stream().collect(Collectors.toMap(StrategyAwardEntity::getAwardId, StrategyAwardEntity::getImage));
        // 兜底奖默认图片
        awardMap.put(0L, "/assets/no-award.svg");
        List<UserAwardRecordVO> list = userAwardRecordPage.getRecords().stream().map(userAwardRecord -> {
            UserAwardRecordVO userAwardRecordVO = new UserAwardRecordVO();
            BeanUtils.copyProperties(userAwardRecord, userAwardRecordVO);
            // 根据奖品 id 从 reids 中获取图片url
            userAwardRecordVO.setImage(awardMap.get(userAwardRecord.getAwardId()));
            return userAwardRecordVO;
        }).toList();
        myPage.setTotal(userAwardRecordPage.getTotal());
        myPage.setItems(list);
        return myPage;
    }
}
