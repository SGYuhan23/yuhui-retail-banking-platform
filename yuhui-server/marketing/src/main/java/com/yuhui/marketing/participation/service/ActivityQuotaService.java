package com.yuhui.marketing.participation.service;

import com.yuhui.marketing.participation.model.entity.*;

/**

 * 活动-额度领域接口
 */
public interface ActivityQuotaService {
    /**
     * 创建 sku 账户充值订单
     */
    UnpaidQuotaOrderEntity createQuotaOrder(QuotaOrderEntity quotaOrderEntity);

    /**
     * 更新 sku 账户充值订单
     */
    void updateQuotaOrder(DeliveryOrderEntity deliveryOrderEntity);

    Integer queryTodayUserLotteryCount(String userId, Long activityId);

    ActivityAccountEntity queryUserActivityAccount(String userId, Long activityId);

    Integer queryTotalUserLotteryCount(String userId, Long activityId);

    /**
     * 创建 抽奖额度 赠送订单
     * @param giftQuotaOrderEntity
     * @return
     */
    void createGiftQuotaOrder(QuotaOrderEntity giftQuotaOrderEntity);
}
