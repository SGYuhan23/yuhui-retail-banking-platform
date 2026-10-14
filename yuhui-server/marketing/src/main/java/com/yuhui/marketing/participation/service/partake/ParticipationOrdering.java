package com.yuhui.marketing.participation.service.partake;

import com.yuhui.marketing.participation.model.aggregate.CreatePartakeOrderAggregate;
import com.yuhui.marketing.participation.model.entity.ActivityEntity;
import com.yuhui.marketing.participation.model.entity.PartakeOrderReqEntity;
import com.yuhui.marketing.participation.model.entity.PartakeOrderResEntity;
import com.yuhui.marketing.participation.model.valobj.ActivityStateVO;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.marketing.participation.service.ActivityPartakeService;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;

import java.util.Date;

import com.yuhui.marketing.participation.model.valobj.UserOrderStateVO;
@org.springframework.stereotype.Service
public class ParticipationOrdering implements ActivityPartakeService {
    @javax.annotation.Resource protected com.yuhui.marketing.participation.repository.ParticipationLedger ledger;

    private final ActivityRepository activityRepository;
    private final ParticipationAccounts accounts;
    public ParticipationOrdering(ActivityRepository repository, ParticipationAccounts accounts) {
        this.activityRepository=repository; this.accounts=accounts;
    }
    @Override
    public PartakeOrderResEntity createPartakeOrder(String userId, Long activityId) {
        return createPartakeOrder(PartakeOrderReqEntity.builder().userId(userId).activityId(activityId).build());
    }

    @Override
    public PartakeOrderResEntity createPartakeOrder(PartakeOrderReqEntity reqEntity) {
        //基础信息
        String userId = reqEntity.getUserId();
        Long activityId = reqEntity.getActivityId();
        Date currentTime = new Date();
        //查询活动
        ActivityEntity activityEntity = activityRepository.queryActivityByActivityId(activityId);
        //判断活动是否开启、是否在活动时间
        if (!ActivityStateVO.open.equals(activityEntity.getState())) {
            throw new AppException(ResponseCode.ACTIVITY_STATE_ERROR.getCode(), ResponseCode.ACTIVITY_STATE_ERROR.getMessage());
        }
        if (currentTime.before(activityEntity.getBeginDateTime()) || currentTime.after(activityEntity.getEndDateTime())) {
            throw new AppException(ResponseCode.ACTIVITY_DATE_ERROR.getCode(), ResponseCode.ACTIVITY_DATE_ERROR.getMessage());
        }
        //查询是否有抽奖单但未被消费,有的话直接返回
        PartakeOrderResEntity partakeOrderResEntity = ledger.queryNoUsedPartakeOrder(reqEntity);
        if (partakeOrderResEntity != null) {
            return partakeOrderResEntity;
        }
        //构建抽奖单
        PartakeOrderResEntity userOrderRes = this.buildUserPartakeOrder(userId, activityId, currentTime);
        //构建聚合对象
        CreatePartakeOrderAggregate createPartakeOrderAggregate = accounts.prepareDebit(userId, activityId, currentTime);
        createPartakeOrderAggregate.setPartakeOrderResEntity(userOrderRes);
        //保存聚合对象
        Long userOrderId =ledger.saveCreatePartakeOrderAggregate(createPartakeOrderAggregate);
        userOrderRes.setId(userOrderId);
        return userOrderRes;
    }

    private PartakeOrderResEntity buildUserPartakeOrder(String userId, Long activityId, Date currentTime) {
        ActivityEntity activityEntity = activityRepository.queryActivityByActivityId(activityId);
        // 构建抽奖单
        PartakeOrderResEntity partakeOrderResEntity = new PartakeOrderResEntity();
        partakeOrderResEntity.setUserId(userId);
        partakeOrderResEntity.setActivityId(activityId);
        partakeOrderResEntity.setActivityName(activityEntity.getActivityName());
        partakeOrderResEntity.setStrategyId(activityEntity.getStrategyId());
        partakeOrderResEntity.setCreateTime(currentTime);
        partakeOrderResEntity.setOrderState(UserOrderStateVO.create);
        return partakeOrderResEntity;
    }
}
