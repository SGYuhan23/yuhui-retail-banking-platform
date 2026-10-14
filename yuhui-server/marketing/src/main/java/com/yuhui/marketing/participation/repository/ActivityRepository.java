package com.yuhui.marketing.participation.repository;

import com.yuhui.marketing.participation.model.entity.*;

import java.util.List;

/**

 * 活动领域仓储接口
 */
public interface ActivityRepository {
    ActivitySkuEntity queryActivitySku(Long sku);

    ActivityEntity queryActivityByActivityId(Long activityId);

    void queryActivityByActivityIdAndRemoveOldKey(Long activityId);

    ActivityCountEntity queryActivityCountByActivityCountId(Long activityCountId);

    void queryActivityCountByActivityCountIdAndRemoveOldKey(Long activityCountId);

    List<ActivitySkuEntity> queryActivitySkuListByActivityId(Long activityId);

    List<SkuProductEntity> querySkuProductEntityListByActivityId(Long activityId);

    void deleteCacheKeyByActivityId(Long activityId);
}
