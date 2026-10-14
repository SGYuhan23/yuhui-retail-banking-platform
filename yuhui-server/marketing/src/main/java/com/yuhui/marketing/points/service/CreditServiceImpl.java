package com.yuhui.marketing.points.service;
import com.yuhui.marketing.points.model.entity.*;
import com.yuhui.marketing.points.model.aggregate.TradeAggregate;
import com.yuhui.marketing.points.repository.CreditRepository;
import org.springframework.stereotype.Service;
@Service
public class CreditServiceImpl implements CreditService {
    private final CreditRepository ledger;
    private final PointsPostingPlan plans;
    public CreditServiceImpl(CreditRepository ledger, PointsPostingPlan plans) { this.ledger=ledger; this.plans=plans; }
    @Override public String createCreditOrder(TradeEntity trade) {
        TradeAggregate plan=plans.prepare(trade);
        ledger.saveTradeAggregate(plan);
        return plan.getCreditOrderEntity().getOrderId();
    }
    @Override public CreditAccountEntity queryUserCreditAccount(String userId,Long activityId) {
        return ledger.queryUserCreditAccount(userId,activityId);
    }
}
