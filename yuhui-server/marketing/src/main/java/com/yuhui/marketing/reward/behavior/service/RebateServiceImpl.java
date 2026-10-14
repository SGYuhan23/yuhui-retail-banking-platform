package com.yuhui.marketing.reward.behavior.service;
import com.yuhui.marketing.reward.behavior.model.aggregate.RebateAggregate;
import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
import com.yuhui.marketing.reward.behavior.model.valobj.RebateVO;
import com.yuhui.marketing.reward.behavior.repository.RebateRepository;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class RebateServiceImpl implements RebateService {
    private final RebateRepository ledger;
    private final BehaviorRewardPlanFactory plans;
    public RebateServiceImpl(RebateRepository ledger, BehaviorRewardPlanFactory plans) {
        this.ledger = ledger; this.plans = plans;
    }
    @Override public List<String> createRebateOrder(BehaviorEntity behavior) {
        return grant(behavior, ledger.queryRebateConfig(behavior), false);
    }
    @Override public void createRebateOrderOfGift(BehaviorEntity behavior) {
        grant(behavior, Collections.singletonList(ledger.queryOneRebateConfig(behavior)), true);
    }
    private List<String> grant(BehaviorEntity behavior, List<RebateVO> configs, boolean rejectDuplicate) {
        List<RebateAggregate> batch = new ArrayList<>();
        List<String> orderIds = new ArrayList<>();
        for (RebateVO config : configs) {
            if (isAddLotteryQuota(behavior.getUserId(), behavior.getActivityId(), config.getBehaviorRebateId())) {
                if (rejectDuplicate) throw new AppException(ResponseCode.USER_ALREADY_RECEIVE_GIFT.getCode(), ResponseCode.USER_ALREADY_RECEIVE_GIFT.getMessage());
                continue;
            }
            RebateAggregate plan = plans.prepare(behavior, config);
            batch.add(plan);
            orderIds.add(plan.getRebateOrderEntity().getOrderId());
        }
        // One repository call preserves all-or-nothing persistence for a multi-reward behavior.
        ledger.saveRebateAggregate(batch);
        return orderIds;
    }
    @Override public boolean queryIsHaveRebateOrder(String userId, Long activityId, String outBusinessNo) {
        return ledger.queryIsHaveRebateOrder(userId, activityId, outBusinessNo);
    }
    @Override public boolean isAddLotteryQuota(String userId, Long activityId, Long configId) {
        return ledger.isReceiveGift(String.valueOf(activityId), configId, userId);
    }
}
