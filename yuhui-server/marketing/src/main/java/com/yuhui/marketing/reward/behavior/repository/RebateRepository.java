package com.yuhui.marketing.reward.behavior.repository;

import com.yuhui.marketing.reward.behavior.model.aggregate.RebateAggregate;
import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
import com.yuhui.marketing.reward.behavior.model.entity.RebateOrderEntity;
import com.yuhui.marketing.reward.behavior.model.valobj.RebateVO;

import java.util.List;

/**

 * 返利领域仓储接口
 */
public interface RebateRepository {

    List<RebateVO> queryRebateConfig(BehaviorEntity behaviorEntity);

    void saveRebateAggregate(List<RebateAggregate> aggregates);

    List<RebateOrderEntity> queryRebateOrder(String userId, String outBusinessNo);

    boolean queryIsHaveRebateOrder(String userId,Long activityId, String outBusinessNo);

    boolean isReceiveGift(String activityId,Long behaviorRebateId,String userId);

    RebateVO queryOneRebateConfig(BehaviorEntity behaviorEntity);
}
