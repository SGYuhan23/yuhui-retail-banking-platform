package com.yuhui.marketing.participation.service.armory;

import com.yuhui.marketing.participation.model.entity.ActivitySkuEntity;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**

 * 活动-装配领域-实现类
 */
@Slf4j
@Service
public class ActivityImpl implements ActivityArmory,ActivityService{
    @javax.annotation.Resource private com.yuhui.marketing.participation.repository.ParticipationInventory inventory;


    @Resource
    private ActivityRepository repository;
//    @Override
//    public boolean assembleActivitySku(Long sku) {
//        // 将库存数放入缓存
//        ActivitySkuEntity activitySkuEntity = repository.queryActivitySku(sku);
//        cacheActivitySkuStockCount(sku,activitySkuEntity.getStockCountSurplus());
//        // 预热次数，放入缓存
//        repository.queryActivityByActivityIdAndRemoveOldKey(activitySkuEntity.getActivityId());
//        // 预热活动，放入缓存
//        repository.queryActivityCountByActivityCountIdAndRemoveOldKey(activitySkuEntity.getActivityCountId());
//        return true;
//    }

    @Override
    public void assembleActivitySkuByActivityId(Long activityId) {
        // 删除所有有关活动的key
        repository.deleteCacheKeyByActivityId(activityId);
        // 查询该活动下的sku列表
        List<ActivitySkuEntity> activitySkuEntityList = repository.queryActivitySkuListByActivityId(activityId);
        for (ActivitySkuEntity activitySkuEntity : activitySkuEntityList) {
            // 将库存数放入缓存
            cacheActivitySkuStockCount(activitySkuEntity.getId(),activitySkuEntity.getStockCountSurplus());
            // 预热次数，放入缓存
            repository.queryActivityCountByActivityCountIdAndRemoveOldKey(activitySkuEntity.getActivityCountId());
        }
        // 预热活动，放入缓存
        repository.queryActivityByActivityIdAndRemoveOldKey(activityId);
    }

    private void cacheActivitySkuStockCount(Long sku, Integer stockCountSurplus) {
        String key = Constants.RedisKey.ACTIVITY_SKU_STOCK_COUNT_KEY + sku;
        inventory.cacheActivitySkuStockCount(key,stockCountSurplus);
    }


    @Override
    public boolean reduceActivitySkuStock(Long sku, Date endDateTime) {
        String key = Constants.RedisKey.ACTIVITY_SKU_STOCK_COUNT_KEY + sku;
        return inventory.reduceActivitySkuStock(sku,key,endDateTime);
    }
}
