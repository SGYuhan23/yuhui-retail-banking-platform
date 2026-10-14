package com.yuhui.marketing.participation.service.quota.rule;

import com.yuhui.marketing.participation.model.entity.ActivityCountEntity;
import com.yuhui.marketing.participation.model.entity.ActivityEntity;
import com.yuhui.marketing.participation.model.entity.ActivitySkuEntity;

/**

 * 活动责任链接口
 */
public interface ActivityChain  {
    boolean action(ActivitySkuEntity activitySkuEntity, ActivityEntity activityEntity, ActivityCountEntity activityCountEntity);
}
