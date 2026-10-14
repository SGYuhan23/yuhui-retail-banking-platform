package com.yuhui.marketing.participation.service.quota.policy.impl;

import com.yuhui.marketing.participation.model.aggregate.CreateQuotaOrderAggregate;
import com.yuhui.marketing.participation.model.valobj.OrderStateVO;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.marketing.participation.service.quota.policy.TradePolicy;
import com.yuhui.types.common.Constants;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**

 * 积分类型订单
 */
@Service(Constants.QuotaModel.CREDIT_PAY_TRADE)
public class CreditPayTradePolicy implements TradePolicy {
    @javax.annotation.Resource protected com.yuhui.marketing.participation.repository.ParticipationLedger ledger;


    @Resource
    private ActivityRepository repository;
    @Override
    public void trade(CreateQuotaOrderAggregate createQuotaOrderAggregate) {
        createQuotaOrderAggregate.getActivityOrderEntity().setState(OrderStateVO.wait_pay);
        ledger.doSaveCreditPayOrder(createQuotaOrderAggregate);
    }
}
