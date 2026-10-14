package com.yuhui.marketing.participation.service.armory;

import java.util.Date;

/**

 * 活动-装配领域-调度接口
 */
public interface ActivityService {
    boolean reduceActivitySkuStock(Long sku, Date endDateTime);
}
