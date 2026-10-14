package com.yuhui.marketing.participation.repository;

import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.model.valobj.ActivitySkuStockKeyVO;

import java.util.Date;
import java.util.List;

/** Inventory reservation and asynchronous stock reconciliation, independent of account transactions. */
public interface ParticipationInventory {
    void cacheActivitySkuStockCount(String key, Integer stockCountSurplus);
    boolean reduceActivitySkuStock(Long sku, String key, Date endDateTime);
    void activitySkuStockConsumeSendQueue(ActivitySkuStockKeyVO build);
    ActivitySkuStockKeyVO takeQueueValue(Long sku);
    void updateActivitySkuStock(Long sku);
    void clearQueueValue(Long sku);
    void clearActivitySkuStock(Long sku);
    List<Long> querySkuList();
}
