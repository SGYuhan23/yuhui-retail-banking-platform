package com.yuhui.marketing.points.repository;

import com.yuhui.marketing.points.model.aggregate.TradeAggregate;
import com.yuhui.marketing.points.model.entity.CreditAccountEntity;

/**

 * 积分领域仓储接口
 */
public interface CreditRepository {
    void saveTradeAggregate(TradeAggregate tradeAggregate);

    CreditAccountEntity queryUserCreditAccount(String userId,Long activityId);
}
