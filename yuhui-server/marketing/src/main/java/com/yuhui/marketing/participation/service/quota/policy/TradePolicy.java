package com.yuhui.marketing.participation.service.quota.policy;

import com.yuhui.marketing.participation.model.aggregate.CreateQuotaOrderAggregate;

/**

 * 订单类型接口
 */
public interface TradePolicy {
    void trade(CreateQuotaOrderAggregate createQuotaOrderAggregate);
}
