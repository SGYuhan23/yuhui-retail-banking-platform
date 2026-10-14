package com.yuhui.marketing.participation.service.partake;

import com.yuhui.marketing.participation.model.aggregate.CreatePartakeOrderAggregate;
import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class ParticipationAccounts {
    @javax.annotation.Resource protected com.yuhui.marketing.participation.repository.ParticipationLedger ledger;

    private final ActivityRepository activityRepository;
    public ParticipationAccounts(ActivityRepository repository) { this.activityRepository=repository; }
    public CreatePartakeOrderAggregate prepareDebit(String userId, Long activityId, Date currentTime) {
        // 查询总账户额度
        ActivityAccountEntity activityAccountEntity = ledger.queryActivityAccountByUserId(userId, activityId);
        // 总剩余额度判断
        if (activityAccountEntity == null || activityAccountEntity.getTotalCountSurplus() <= 0) {
            throw new AppException(ResponseCode.ACCOUNT_QUOTA_ERROR.getCode(), ResponseCode.ACCOUNT_QUOTA_ERROR.getMessage());
        }
        String month = new SimpleDateFormat("yyyy-MM").format(currentTime);
        String day = new SimpleDateFormat("yyyy-MM-dd").format(currentTime);
        // 查询月账户额度
        ActivityAccountMonthEntity activityAccountMonthEntity = ledger.queryActivityAccountMonthByUserId(userId, activityId, month);
        if (activityAccountMonthEntity != null && activityAccountMonthEntity.getMonthCountSurplus() <= 0) {
            throw new AppException(ResponseCode.ACCOUNT_MONTH_QUOTA_ERROR.getCode(), ResponseCode.ACCOUNT_MONTH_QUOTA_ERROR.getMessage());
        }
        // 创建月账户信息；true = 存在月账户、false = 不存在月账户
        boolean isExistAccountMonth = null != activityAccountMonthEntity;
        if (activityAccountMonthEntity == null) {
            activityAccountMonthEntity = new ActivityAccountMonthEntity();
            activityAccountMonthEntity.setUserId(userId);
            activityAccountMonthEntity.setActivityId(activityId);
            activityAccountMonthEntity.setMonth(month);
            activityAccountMonthEntity.setMonthCount(activityAccountEntity.getMonthCount());
            activityAccountMonthEntity.setMonthCountSurplus(activityAccountEntity.getMonthCountSurplus());
        }
        // 查询日账户额度
        ActivityAccountDayEntity activityAccountDayEntity = ledger.queryActivityAccountDayByUserId(userId, activityId, day);
        if (null != activityAccountDayEntity && activityAccountDayEntity.getDayCountSurplus() <= 0) {
            throw new AppException(ResponseCode.ACCOUNT_DAY_QUOTA_ERROR.getCode(), ResponseCode.ACCOUNT_DAY_QUOTA_ERROR.getMessage());
        }
        // 创建日账户信息；true = 存在日账户、false = 不存在日账户
        boolean isExistAccountDay = null != activityAccountDayEntity;
        if (null == activityAccountDayEntity) {
            activityAccountDayEntity = new ActivityAccountDayEntity();
            activityAccountDayEntity.setUserId(userId);
            activityAccountDayEntity.setActivityId(activityId);
            activityAccountDayEntity.setDay(day);
            activityAccountDayEntity.setDayCount(activityAccountEntity.getDayCount());
            activityAccountDayEntity.setDayCountSurplus(activityAccountEntity.getDayCountSurplus());
        }
        // 构建对象
        CreatePartakeOrderAggregate createPartakeOrderAggregate = new CreatePartakeOrderAggregate();
        createPartakeOrderAggregate.setUserId(userId);
        createPartakeOrderAggregate.setActivityId(activityId);
        createPartakeOrderAggregate.setActivityAccountEntity(activityAccountEntity);
        createPartakeOrderAggregate.setExistAccountMonth(isExistAccountMonth);
        createPartakeOrderAggregate.setActivityAccountMonthEntity(activityAccountMonthEntity);
        createPartakeOrderAggregate.setExistAccountDay(isExistAccountDay);
        createPartakeOrderAggregate.setActivityAccountDayEntity(activityAccountDayEntity);
        return createPartakeOrderAggregate;
    }

}
