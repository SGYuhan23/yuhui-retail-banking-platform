package com.yuhui.marketing.participation.service.product;

import com.yuhui.marketing.participation.model.entity.SkuProductEntity;
import com.yuhui.marketing.participation.repository.ActivityRepository;
import com.yuhui.marketing.participation.service.ActivitySkuProductService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**

 * sku商品服务实现类
 */
@Service
public class ActivitySkuProductServiceImpl implements ActivitySkuProductService {
    @Resource
    private ActivityRepository repository;
    @Override
    public List<SkuProductEntity> querySkuProductEntityListByActivityId(Long activityId) {
        return repository.querySkuProductEntityListByActivityId(activityId);
    }
}
