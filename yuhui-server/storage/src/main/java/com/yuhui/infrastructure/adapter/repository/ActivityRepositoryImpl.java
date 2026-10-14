package com.yuhui.infrastructure.adapter.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.model.valobj.ActivityStateVO;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**

 * 活动领域仓储实现
 */
@Repository
@Slf4j
public class ActivityRepositoryImpl implements ActivityRepository {
    @Resource
    private RedisService redisService;
    @Resource
    private ActivityMapper activityMapper;
    @Resource
    private ActivitySkuMapper activitySkuMapper;
    @Resource
    private ActivityCountMapper activityCountMapper;

    @Override
    public ActivitySkuEntity queryActivitySku(Long sku) {
        LambdaQueryWrapper<ActivitySku> queryWrapper = new QueryWrapper<ActivitySku>().lambda().eq(ActivitySku::getId, sku);
        ActivitySku activitySku = activitySkuMapper.selectOne(queryWrapper);
        ActivitySkuEntity activitySkuEntity = new ActivitySkuEntity();
        BeanUtils.copyProperties(activitySku, activitySkuEntity);
        return activitySkuEntity;
    }

    @Override
    public ActivityEntity queryActivityByActivityId(Long activityId) {
        // 优先从缓存获取
        String cacheKey = Constants.RedisKey.ACTIVITY_KEY + activityId;
        ActivityEntity activityEntity = redisService.getValue(cacheKey);
        if (activityEntity != null) {
            return activityEntity;
        }
        // 从库中获取数据
        LambdaQueryWrapper<Activity> queryWrapper = new QueryWrapper<Activity>().lambda().eq(Activity::getId, activityId);
        Activity activity = activityMapper.selectOne(queryWrapper);
        ActivityEntity dbActivityEntity = new ActivityEntity();
        BeanUtils.copyProperties(activity, dbActivityEntity);
        dbActivityEntity.setState(ActivityStateVO.valueOf(activity.getState()));
        redisService.setValue(cacheKey, dbActivityEntity);
        return dbActivityEntity;
    }

    @Override
    public void queryActivityByActivityIdAndRemoveOldKey(Long activityId) {
        // 清除旧key
//        redisService.remove(Constants.RedisKey.ACTIVITY_KEY + activityId);
        queryActivityByActivityId(activityId);
    }

    @Override
    public ActivityCountEntity queryActivityCountByActivityCountId(Long activityCountId) {
        // 优先从缓存获取
        String cacheKey = Constants.RedisKey.ACTIVITY_COUNT_KEY + activityCountId;
        ActivityCountEntity activityCountEntity = redisService.getValue(cacheKey);
        if (activityCountEntity != null) {
            return activityCountEntity;
        }
        // 从库中获取数据
        LambdaQueryWrapper<ActivityCount> queryWrapper = new QueryWrapper<ActivityCount>().lambda().eq(ActivityCount::getId, activityCountId);
        ActivityCount activityCount = activityCountMapper.selectOne(queryWrapper);
        ActivityCountEntity dbActivityCountEntity = new ActivityCountEntity();
        BeanUtils.copyProperties(activityCount, dbActivityCountEntity);
        redisService.setValue(cacheKey, dbActivityCountEntity);
        return dbActivityCountEntity;
    }

    @Override
    public void queryActivityCountByActivityCountIdAndRemoveOldKey(Long activityCountId) {
        redisService.remove(Constants.RedisKey.ACTIVITY_COUNT_KEY + activityCountId);
        queryActivityCountByActivityCountId(activityCountId);
    }

    @Override
    public List<ActivitySkuEntity> queryActivitySkuListByActivityId(Long activityId) {
        LambdaQueryWrapper<ActivitySku> queryWrapper = new QueryWrapper<ActivitySku>().lambda()
                .eq(ActivitySku::getActivityId, activityId);
        List<ActivitySku> activitySkus = activitySkuMapper.selectList(queryWrapper);
        return activitySkus.stream()
                .map(activitySku -> {
                    ActivitySkuEntity activitySkuEntity = new ActivitySkuEntity();
                    BeanUtils.copyProperties(activitySku, activitySkuEntity);
                    return activitySkuEntity;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SkuProductEntity> querySkuProductEntityListByActivityId(Long activityId) {
        LambdaQueryWrapper<ActivitySku> queryWrapper = new QueryWrapper<ActivitySku>().lambda()
                .eq(ActivitySku::getActivityId, activityId);
        List<ActivitySku> activitySkus = activitySkuMapper.selectList(queryWrapper);
        ArrayList<SkuProductEntity> skuProductEntities = new ArrayList<>();
        for (ActivitySku sku : activitySkus) {
            LambdaQueryWrapper<ActivityCount> wrapper = new QueryWrapper<ActivityCount>().lambda()
                    .eq(ActivityCount::getId, sku.getActivityCountId());
            ActivityCount activityCount = activityCountMapper.selectOne(wrapper);
            SkuProductEntity.ActivityCount count = new SkuProductEntity.ActivityCount();
            BeanUtils.copyProperties(activityCount, count);
            SkuProductEntity skuProduct = new SkuProductEntity();
            BeanUtils.copyProperties(sku, skuProduct);
            skuProduct.setActivityCount(count);
            skuProductEntities.add(skuProduct);
        }
        return skuProductEntities;
    }

    @Override
    public void deleteCacheKeyByActivityId(Long activityId) {
        redisService.deleteKeysWithPattern(activityId.toString());
    }

}
