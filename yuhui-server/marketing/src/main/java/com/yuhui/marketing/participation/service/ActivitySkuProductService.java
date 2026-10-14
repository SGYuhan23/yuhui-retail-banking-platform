package com.yuhui.marketing.participation.service;

import com.yuhui.marketing.participation.model.entity.SkuProductEntity;

import java.util.List;

/**

 * sku商品服务接口
 */
public interface ActivitySkuProductService {

    /**
     * 查询当前活动ID下，sku商品列表
     * @param activityId 活动ID
     * @return 返回sku商品列表
     */
    List<SkuProductEntity> querySkuProductEntityListByActivityId(Long activityId);

}
