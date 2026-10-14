package com.yuhui.marketing.reward.fulfillment.repository;

import com.yuhui.marketing.reward.fulfillment.model.aggregate.CountPrizesAggregate;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.GiveOutPrizesAggregate;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.UserAwardRecordAggregate;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;

/**

 * 奖品领域仓储接口
 */
public interface UserAwardRepository {
    void saveUserAwardRecord(UserAwardRecordAggregate userAwardRecordAggregate);



    String queryAwardKey(Long awardId);






}
