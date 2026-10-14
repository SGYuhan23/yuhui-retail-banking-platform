package com.yuhui.querys.adapter.repository;


import com.yuhui.querys.model.valobj.*;
import com.yuhui.types.model.MyPage;

import java.util.List;

public interface ErpRepository {
    List<ActivityVO> queryActivityVOList();

    void addActivityVO(ActivityVO activityVO);

    void updateActivityVO(ActivityVO activityVO);

    void deleteActivityVO(Long activityId);

    List<ActivityCountVO> queryActivityCountVOList();

    void addActivityCountVO(ActivityCountVO activityCountVO);

    void updateActivityCountVO(ActivityCountVO activityCountVO);

    void deleteActivityCountVO(Long activityCountId);

    List<ActivitySkuVO> queryActivitySkuVOList();

    void addActivitySkuVO(ActivitySkuVO activitySkuVO);

    void updateActivitySkuVO(ActivitySkuVO activitySkuVO);

    void deleteActivitySkuVO(Long activitySkuId);

    List<BehaviorRebateVO> queryBehaviorRebateVOList();

    List<BehaviorRebateVO> queryBehaviorRebateVOListOfGift(Long activityId);

    void addBehaviorRebateVO(BehaviorRebateVO behaviorRebateVO);

    void updateBehaviorRebateVO(BehaviorRebateVO behaviorRebateVO);

    void deleteBehaviorRebateVO(Long behaviorRebateId);

    List<AwardResponseVO> queryAwardVOList();

    void addAwardVO(AwardResponseVO awardResponseVO);

    void updateAwardVO(AwardResponseVO awardResponseVO);

    void deleteAwardVO(Long awardId);

    List<StrategyVO> queryStrategyVOList();

    void addStrategyVO(StrategyVO strategyVO);

    void updateStrategyVO(StrategyVO strategyVO);

    void deleteStrategyVO(Long strategyId);

    List<RuleVO> queryRuleVOList();

    void addRuleVO(RuleVO ruleVO);

    void updateRuleVO(RuleVO ruleVO);

    void deleteRuleVO(Long ruleId);

    List<StrategyAwardVO> queryStrategyAwardVOList();

    void addStrategyAwardVO(StrategyAwardVO strategyAwardVO);

    void updateStrategyAwardVO(StrategyAwardVO strategyAwardVO);

    void deleteStrategyAwardVO(Long strategyAwardId);

    List<RuleTreeVO> queryRuleTreeVOList();

    void addRuleTreeVO(RuleTreeVO ruleTreeVO);

    void updateRuleTreeVO(RuleTreeVO ruleTreeVO);

    void deleteRuleTreeVO(Long ruleTreeId);

    List<RuleTreeNodeVO> queryRuleTreeNodeVO();

    void addRuleTreeNodeVO(RuleTreeNodeVO ruleTreeNodeVO);

    void updateRuleTreeNodeVO(RuleTreeNodeVO ruleTreeNodeVO);

    void deleteRuleTreeNodeVO(Long ruleTreeNodeId);

    List<RuleTreeNodeLineVO> queryRuleTreeNodeLineVO();

    void addRuleTreeNodeLineVO(RuleTreeNodeLineVO ruleTreeNodeLineVO);

    void updateRuleTreeNodeLineVO(RuleTreeNodeLineVO ruleTreeNodeLineVO);

    void deleteRuleTreeNodeLineVO(Long ruleTreeNodeLineId);

    List<RuleTreeNodeVO> queryRuleTreeNodeVOByRuleTreeId(String ruleTreeId);

    MyPage<UserAwardRecordVO> queryUserAwardRecordVOListByPage(Integer pageNum, Integer pageSize, Long activityId, String userId);
}
