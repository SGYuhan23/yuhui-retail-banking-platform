package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.BehaviorRebateRequestDTO;
import com.yuhui.trigger.api.dto.res.BehaviorRebateResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface BehaviorRebateService {
    BaseResponse<List<BehaviorRebateResponseDTO>> queryBehaviorRebate();

    BaseResponse<List<BehaviorRebateResponseDTO>> queryBehaviorRebateOfGift(Long activityId);

    BaseResponse<Boolean> addBehaviorRebate(BehaviorRebateRequestDTO request);

    BaseResponse<Boolean> updateBehaviorRebate(BehaviorRebateRequestDTO request);

    BaseResponse<Boolean> deleteBehaviorRebate(Long behaviorRebateId);
}
