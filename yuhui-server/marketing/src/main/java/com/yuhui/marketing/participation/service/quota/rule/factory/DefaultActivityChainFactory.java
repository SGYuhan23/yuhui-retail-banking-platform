package com.yuhui.marketing.participation.service.quota.rule.factory;
import com.yuhui.marketing.participation.service.quota.rule.ActivityChain;
import com.yuhui.types.common.Constants;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service
public class DefaultActivityChainFactory {
    private final ActivityChain admission;
    private final ActivityChain reservation;
    public DefaultActivityChainFactory(Map<String, ActivityChain> policies) {
        admission = policies.get(Constants.ActivityModel.ACTIVITY_BASE);
        reservation = policies.get(Constants.ActivityModel.ACTIVITY_SKU_STOCK);
    }
    public ActivityChain openActivityChain() {
        // Validate before reserving stock; invalid activities cannot consume inventory.
        return (sku, activity, count) -> admission.action(sku, activity, count)
                && reservation.action(sku, activity, count);
    }
}
