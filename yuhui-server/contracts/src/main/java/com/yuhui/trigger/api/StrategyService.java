package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.StrategyRequestDTO;
import com.yuhui.trigger.api.dto.res.StrategyResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface StrategyService {
    BaseResponse<List<StrategyResponseDTO>> queryStrategy();

    BaseResponse<Boolean> addStrategy(StrategyRequestDTO request);

    BaseResponse<Boolean> updateStrategy(StrategyRequestDTO request);

    BaseResponse<Boolean> deleteStrategy(Long strategyId);
}
