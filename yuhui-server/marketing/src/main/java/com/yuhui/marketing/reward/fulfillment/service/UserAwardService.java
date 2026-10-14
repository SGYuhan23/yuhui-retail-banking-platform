package com.yuhui.marketing.reward.fulfillment.service;

import com.yuhui.marketing.reward.fulfillment.model.entity.DistributeAwardEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;

/**

 * 奖品领域接口
 */
public interface UserAwardService {
    /**
     * 保存奖品发放记录
     */
    void saveUserAwardRecord(UserAwardRecordEntity userAwardRecordEntity);
    /**
     * 发奖
     */
    void distributeAward(DistributeAwardEntity distributeAwardEntity);
}
