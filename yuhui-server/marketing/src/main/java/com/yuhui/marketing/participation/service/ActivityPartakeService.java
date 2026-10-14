package com.yuhui.marketing.participation.service;

import com.yuhui.marketing.participation.model.entity.PartakeOrderReqEntity;
import com.yuhui.marketing.participation.model.entity.PartakeOrderResEntity;

/**

 * 活动-参与领域接口
 */
public interface ActivityPartakeService {
    /**
     * 创建抽奖单
     */
    PartakeOrderResEntity createPartakeOrder(PartakeOrderReqEntity reqEntity);

    /**
     * 创建抽奖单
     */
    PartakeOrderResEntity createPartakeOrder(String userId, Long activityId);
}
