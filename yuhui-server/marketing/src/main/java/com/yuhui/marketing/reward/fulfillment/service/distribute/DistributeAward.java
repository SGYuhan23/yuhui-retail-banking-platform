package com.yuhui.marketing.reward.fulfillment.service.distribute;

import com.yuhui.marketing.reward.fulfillment.model.entity.DistributeAwardEntity;

/**

 * 奖品领域-发奖接口
 */
public interface DistributeAward {
    void giveOutPrizes(DistributeAwardEntity distributeAwardEntity);
}
