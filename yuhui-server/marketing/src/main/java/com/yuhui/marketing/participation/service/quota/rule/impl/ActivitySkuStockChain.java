package com.yuhui.marketing.participation.service.quota.rule.impl;

import com.yuhui.marketing.participation.model.entity.ActivityCountEntity;
import com.yuhui.marketing.participation.model.entity.ActivityEntity;
import com.yuhui.marketing.participation.model.entity.ActivitySkuEntity;
import com.yuhui.marketing.participation.model.valobj.ActivitySkuStockKeyVO;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.marketing.participation.service.armory.ActivityService;
import com.yuhui.marketing.participation.service.quota.rule.ActivityChain;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**

 * 商品库存扣减节点
 */
@Slf4j
@Component(Constants.ActivityModel.ACTIVITY_SKU_STOCK)
public class ActivitySkuStockChain implements ActivityChain {
    @javax.annotation.Resource private com.yuhui.marketing.participation.repository.ParticipationInventory inventory;


    @Resource
    private ActivityService activityService;
    @Resource
    private ActivityRepository repository;

    @Override
    public boolean action(ActivitySkuEntity activitySkuEntity, ActivityEntity activityEntity, ActivityCountEntity activityCountEntity) {
        log.debug("【活动责任链-ActivitySkuStockChain】-suk库存扣减开始 skuId:{} activityId:{}", activitySkuEntity.getId(), activityEntity.getId());
        //扣减总库存
        boolean status = activityService.reduceActivitySkuStock(activitySkuEntity.getId(), activityEntity.getEndDateTime());
        if (!status) {
            log.error("【活动责任链-ActivitySkuStockChain】-suk库存扣减失败");
            throw new AppException(ResponseCode.ACTIVITY_SKU_STOCK_ZERO.getCode(), ResponseCode.ACTIVITY_SKU_STOCK_ZERO.getMessage());
        }
        log.debug("【活动责任链-ActivitySkuStockChain】-suk库存扣减成功");
        // 写入延迟队列，通过redis延迟队列更新数据库
        inventory.activitySkuStockConsumeSendQueue(ActivitySkuStockKeyVO.builder()
                .sku(activitySkuEntity.getId())
                .activityId(activityEntity.getId())
                .build());

        return true;
    }
}
