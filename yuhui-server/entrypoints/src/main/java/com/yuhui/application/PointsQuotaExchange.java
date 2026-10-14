package com.yuhui.application;
import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.model.valobj.OrderTradeTypeVO;
import com.yuhui.marketing.participation.service.ActivityQuotaService;
import com.yuhui.marketing.points.model.entity.TradeEntity;
import com.yuhui.marketing.points.model.valobj.*;
import com.yuhui.marketing.points.service.CreditService;
import org.redisson.api.*;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
/** Holds the user/activity lock over quota creation and points posting; fulfillment remains asynchronous. */
@Service
public class PointsQuotaExchange {
    private final RedissonClient exchangeRedisson;
    private final ActivityQuotaService activityQuotaService;
    private final CreditService creditService;
    public PointsQuotaExchange(RedissonClient locks, ActivityQuotaService quotas,CreditService credits) {
        this.exchangeRedisson=locks;this.activityQuotaService=quotas;this.creditService=credits;
    }
    public void exchange(String userId,Long activityId,Long sku) {
        RLock exchangeLock = exchangeRedisson.getLock("credit-exchange:" + userId + ":" + activityId);
        exchangeLock.lock();
        try {
        QuotaOrderEntity quotaOrderEntity = new QuotaOrderEntity();
        quotaOrderEntity.setUserId(userId);
        quotaOrderEntity.setActivityId(activityId);
        quotaOrderEntity.setSku(sku);
        quotaOrderEntity.setOutBusinessNo(RandomStringUtils.randomNumeric(12));
        quotaOrderEntity.setOrderTradeTypeVO(OrderTradeTypeVO.credit_pay_trade);
        UnpaidQuotaOrderEntity quotaOrder = activityQuotaService.createQuotaOrder(quotaOrderEntity);
        TradeEntity tradeEntity = new TradeEntity();
        tradeEntity.setUserId(userId);
        tradeEntity.setActivityId(activityId);
        tradeEntity.setTradeName(TradeNameVO.CONVERT_SKU);
        tradeEntity.setTradeType(TradeTypeVO.REVERSE);
        tradeEntity.setOutBusinessNo(quotaOrder.getOutBusinessNo());
        tradeEntity.setAmount(quotaOrder.getPayAmount());
        String creditOrder = creditService.createCreditOrder(tradeEntity);
        } finally {
            if (exchangeLock.isHeldByCurrentThread()) exchangeLock.unlock();
        }
    }
}
