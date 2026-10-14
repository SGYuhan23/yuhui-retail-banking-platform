package com.yuhui.marketing.participation.service.quota.rule.impl;

import com.yuhui.marketing.participation.model.entity.ActivityCountEntity;
import com.yuhui.marketing.participation.model.entity.ActivityEntity;
import com.yuhui.marketing.participation.model.entity.ActivitySkuEntity;
import com.yuhui.marketing.participation.model.valobj.ActivityStateVO;
import com.yuhui.marketing.participation.service.quota.rule.ActivityChain;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;

/**

 * 活动规则过滤节点【日期、状态、库存】
 */
@Slf4j
@Component(Constants.ActivityModel.ACTIVITY_BASE)
public class ActivityBaseChain implements ActivityChain {
    @Override
    public boolean action(ActivitySkuEntity activitySkuEntity, ActivityEntity activityEntity, ActivityCountEntity activityCountEntity) {
        log.debug("【活动责任链-ActivityBaseChain】-日期、状态、库存校验开始 sukId:{} activityId:{}", activitySkuEntity.getId(), activityEntity.getId());
        //是否开启
        if (!ActivityStateVO.open.equals(activityEntity.getState())) {
            throw new AppException(ResponseCode.ACTIVITY_STATE_ERROR.getCode(), ResponseCode.ACTIVITY_STATE_ERROR.getMessage());
        }
        //校验日期是否在活动期间
        Date date = new Date();
        if (date.before(activityEntity.getBeginDateTime()) || date.after(activityEntity.getEndDateTime())) {
            throw new AppException(ResponseCode.ACTIVITY_DATE_ERROR.getCode(), ResponseCode.ACTIVITY_DATE_ERROR.getMessage());
        }
        //校验是否还存在sku库存
        if (activitySkuEntity.getStockCountSurplus() <= 0) {
            throw new AppException(ResponseCode.ACTIVITY_SKU_STOCK_ZERO.getCode(), ResponseCode.ACTIVITY_SKU_STOCK_ZERO.getMessage());
        }
        log.debug("【活动责任链-ActivityBaseChain】-日期、状态、库存校验通过");
        //执行责任链的下一个节点
        return true;
    }
}
