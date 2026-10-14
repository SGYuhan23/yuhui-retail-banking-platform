package com.yuhui.marketing.participation.repository;

import com.yuhui.marketing.participation.model.aggregate.CreatePartakeOrderAggregate;
import com.yuhui.marketing.participation.model.aggregate.CreateQuotaOrderAggregate;
import com.yuhui.marketing.participation.model.entity.*;

import java.math.BigDecimal;

/** Narrow port for ParticipationLedger; no catalog or unrelated storage dependencies. */
public interface ParticipationLedger {
    void doSaveNoPayOrder(CreateQuotaOrderAggregate createQuotaOrderAggregate);
    void doSaveCreditPayOrder(CreateQuotaOrderAggregate createQuotaOrderAggregate);
    PartakeOrderResEntity queryNoUsedPartakeOrder(PartakeOrderReqEntity reqEntity);
    ActivityAccountEntity queryActivityAccountByUserId(String userId, Long activityId);
    ActivityAccountMonthEntity queryActivityAccountMonthByUserId(String userId, Long activityId, String month);
    ActivityAccountDayEntity queryActivityAccountDayByUserId(String userId, Long activityId, String day);
    Long saveCreatePartakeOrderAggregate(CreatePartakeOrderAggregate createPartakeOrderAggregate);
    Integer queryTodayUserLotteryCount(String userId, Long activityId);
    ActivityAccountEntity queryUserActivityAccount(String userId, Long activityId);
    Integer queryTotalUserLotteryCount(String userId, Long activityId);
    void updateQuotaOrder(DeliveryOrderEntity deliveryOrderEntity);
    UnpaidQuotaOrderEntity queryUnpaidQuotaOrder(QuotaOrderEntity quotaOrderEntity);
    BigDecimal queryUserCreditAccountAmount(String userId,Long activityId);
    void doSaveNoPayGiftOrder(CreateQuotaOrderAggregate createQuotaOrderAggregate);
}
