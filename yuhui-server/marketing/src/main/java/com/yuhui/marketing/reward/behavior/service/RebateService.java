package com.yuhui.marketing.reward.behavior.service;

import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
import com.yuhui.marketing.reward.behavior.model.entity.RebateOrderEntity;

import java.util.List;

/**

 * 返利领域接口
 */
public interface RebateService {
    List<String> createRebateOrder(BehaviorEntity behaviorEntity);

    void createRebateOrderOfGift(BehaviorEntity behaviorEntity);

//    List<RebateOrderEntity> queryRebateOrder(String userId, String outBusinessNo);

    boolean queryIsHaveRebateOrder(String userId, Long activityId,String outBusinessNo);

    boolean isAddLotteryQuota(String userId, Long activityId,Long behaviorRebateId);
}
