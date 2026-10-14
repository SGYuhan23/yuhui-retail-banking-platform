package com.yuhui.marketing.participation.service.quota;

import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.model.valobj.ActivitySkuStockKeyVO;
import com.yuhui.marketing.participation.service.ActivitySkuStockService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuotaInventory implements ActivitySkuStockService {
    @javax.annotation.Resource private com.yuhui.marketing.participation.repository.ParticipationInventory inventory;

    @Override
    public ActivitySkuStockKeyVO takeQueueValue(Long sku) {
        return inventory.takeQueueValue(sku);
    }

    @Override
    public void updateActivitySkuStock(Long sku) {
        inventory.updateActivitySkuStock(sku);
    }

    @Override
    public void clearActivitySkuStock(Long sku) {
        inventory.clearActivitySkuStock(sku);
    }

    @Override
    public void clearQueueValue(Long sku) {
        inventory.clearQueueValue(sku);
    }

    @Override
    public List<Long> querySkuList() {
        return inventory.querySkuList();
    }

}
