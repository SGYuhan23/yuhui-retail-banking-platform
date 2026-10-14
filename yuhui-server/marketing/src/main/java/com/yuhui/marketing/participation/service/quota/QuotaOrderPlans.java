package com.yuhui.marketing.participation.service.quota;

import com.yuhui.marketing.participation.model.aggregate.CreateQuotaOrderAggregate;
import com.yuhui.marketing.participation.model.entity.*;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class QuotaOrderPlans {
    public CreateQuotaOrderAggregate buildGiftOrderAggregate(QuotaOrderEntity giftQuotaOrderEntity) {
        ActivityOrderEntity activityOrderEntity = new ActivityOrderEntity();
        activityOrderEntity.setOutBusinessNo(giftQuotaOrderEntity.getOutBusinessNo());
        return CreateQuotaOrderAggregate.builder()
                .userId(giftQuotaOrderEntity.getUserId())
                .activityId(giftQuotaOrderEntity.getActivityId())
                .totalCount(Integer.valueOf(giftQuotaOrderEntity.getRebateConfig()))
                .monthCount(Integer.valueOf(giftQuotaOrderEntity.getRebateConfig()))
                .dayCount(Integer.valueOf(giftQuotaOrderEntity.getRebateConfig()))
                .activityOrderEntity(activityOrderEntity)
                .build();
    }

    public CreateQuotaOrderAggregate buildOrderAggregate(QuotaOrderEntity quotaOrderEntity, ActivitySkuEntity activitySkuEntity, ActivityEntity activityEntity, ActivityCountEntity activityCountEntity) {
        ActivityOrderEntity activityOrderEntity = new ActivityOrderEntity();
        activityOrderEntity.setUserId(quotaOrderEntity.getUserId());
        activityOrderEntity.setSku(quotaOrderEntity.getSku());
        activityOrderEntity.setActivityId(activityEntity.getId());
        activityOrderEntity.setActivityName(activityEntity.getActivityName());
        activityOrderEntity.setStrategyId(activityEntity.getStrategyId());
        activityOrderEntity.setOrderId(RandomStringUtils.randomNumeric(12));
        activityOrderEntity.setOrderTime(new Date());
        activityOrderEntity.setTotalCount(activityCountEntity.getTotalCount());
        activityOrderEntity.setDayCount(activityCountEntity.getDayCount());
        activityOrderEntity.setMonthCount(activityCountEntity.getMonthCount());
        activityOrderEntity.setPayAmount(activitySkuEntity.getProductAmount());
        activityOrderEntity.setOutBusinessNo(quotaOrderEntity.getOutBusinessNo());

        return CreateQuotaOrderAggregate.builder()
                .userId(quotaOrderEntity.getUserId())
                .activityId(activitySkuEntity.getActivityId())
                .totalCount(activityCountEntity.getTotalCount())
                .dayCount(activityCountEntity.getDayCount())
                .monthCount(activityCountEntity.getMonthCount())
                .activityOrderEntity(activityOrderEntity)
                .build();

    }


}
