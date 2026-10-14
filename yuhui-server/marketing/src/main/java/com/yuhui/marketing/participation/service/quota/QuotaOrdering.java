package com.yuhui.marketing.participation.service.quota;

import com.yuhui.marketing.participation.model.aggregate.CreateQuotaOrderAggregate;
import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.model.valobj.OrderTradeTypeVO;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.marketing.participation.service.ActivityQuotaService;
import com.yuhui.marketing.participation.service.quota.policy.TradePolicy;
import com.yuhui.marketing.participation.service.quota.rule.ActivityChain;
import com.yuhui.marketing.participation.service.quota.rule.factory.DefaultActivityChainFactory;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import org.apache.commons.lang3.StringUtils;

import java.math.BigDecimal;
import java.util.Map;

@org.springframework.stereotype.Service
public class QuotaOrdering implements ActivityQuotaService {
    @javax.annotation.Resource protected com.yuhui.marketing.participation.repository.ParticipationLedger ledger;

    private final ActivityRepository activityRepository;
    private final DefaultActivityChainFactory defaultActivityChainFactory;
    private final Map<String, TradePolicy> tradePolicyGroup;
    private final QuotaOrderPlans plans;
    public QuotaOrdering(ActivityRepository repository, DefaultActivityChainFactory eligibility, Map<String, TradePolicy> policies, QuotaOrderPlans plans) {
        this.activityRepository=repository; this.defaultActivityChainFactory=eligibility; this.tradePolicyGroup=policies; this.plans=plans;
    }
    @Override
    public UnpaidQuotaOrderEntity createQuotaOrder(QuotaOrderEntity quotaOrderEntity) {
        String userId = quotaOrderEntity.getUserId();
        Long activityId = quotaOrderEntity.getActivityId();
        Long sku = quotaOrderEntity.getSku();
        String outBusinessNo = quotaOrderEntity.getOutBusinessNo();
        if (sku == null || StringUtils.isBlank(userId) || StringUtils.isBlank(outBusinessNo)) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }

        UnpaidQuotaOrderEntity unpaidCreditOrder = ledger.queryUnpaidQuotaOrder(quotaOrderEntity);
        if (unpaidCreditOrder != null) {
            return unpaidCreditOrder;
        }

        ActivitySkuEntity activitySkuEntity = activityRepository.queryActivitySku(sku);
        ActivityEntity activityEntity = activityRepository.queryActivityByActivityId(activitySkuEntity.getActivityId());
        ActivityCountEntity activityCountEntity = activityRepository.queryActivityCountByActivityCountId(activitySkuEntity.getActivityCountId());

        if (OrderTradeTypeVO.credit_pay_trade.equals(quotaOrderEntity.getOrderTradeTypeVO())){
            BigDecimal availableAmount = ledger.queryUserCreditAccountAmount(userId,activityId);
            if (availableAmount.compareTo(activitySkuEntity.getProductAmount()) < 0) {
                throw new AppException(ResponseCode.USER_CREDIT_ACCOUNT_NO_AVAILABLE_AMOUNT.getCode(), ResponseCode.USER_CREDIT_ACCOUNT_NO_AVAILABLE_AMOUNT.getMessage());
            }
        }

        ActivityChain activityChain = defaultActivityChainFactory.openActivityChain();
        activityChain.action(activitySkuEntity, activityEntity, activityCountEntity);

        CreateQuotaOrderAggregate createQuotaOrderAggregate = plans.buildOrderAggregate(quotaOrderEntity, activitySkuEntity, activityEntity, activityCountEntity);

        TradePolicy tradePolicy = tradePolicyGroup.get(quotaOrderEntity.getOrderTradeTypeVO().getCode());
        tradePolicy.trade(createQuotaOrderAggregate);

        ActivityOrderEntity activityOrderEntity = createQuotaOrderAggregate.getActivityOrderEntity();
        return UnpaidQuotaOrderEntity.builder()
                .userId(activityOrderEntity.getUserId())
                .activityId(activityOrderEntity.getActivityId())
                .orderId(activityOrderEntity.getOrderId())
                .outBusinessNo(activityOrderEntity.getOutBusinessNo())
                .payAmount(activityOrderEntity.getPayAmount())
                .build();
    }

    @Override
    public void createGiftQuotaOrder(QuotaOrderEntity giftQuotaOrderEntity) {
        String userId = giftQuotaOrderEntity.getUserId();
        String outBusinessNo = giftQuotaOrderEntity.getOutBusinessNo();
        if (StringUtils.isBlank(userId) || StringUtils.isBlank(outBusinessNo)) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }

        CreateQuotaOrderAggregate createQuotaOrderAggregate = plans.buildGiftOrderAggregate(giftQuotaOrderEntity);

        TradePolicy tradePolicy = tradePolicyGroup.get(giftQuotaOrderEntity.getOrderTradeTypeVO().getCode());
        tradePolicy.trade(createQuotaOrderAggregate);

    }

    @Override
    public void updateQuotaOrder(DeliveryOrderEntity deliveryOrderEntity) {
        ledger.updateQuotaOrder(deliveryOrderEntity);
    }

    @Override
    public Integer queryTodayUserLotteryCount(String userId, Long activityId) {
        return ledger.queryTodayUserLotteryCount(userId, activityId);
    }

    @Override
    public ActivityAccountEntity queryUserActivityAccount(String userId, Long activityId) {
        return ledger.queryUserActivityAccount(userId, activityId);
    }

    @Override
    public Integer queryTotalUserLotteryCount(String userId, Long activityId) {
        return ledger.queryTotalUserLotteryCount(userId, activityId);
    }
}
