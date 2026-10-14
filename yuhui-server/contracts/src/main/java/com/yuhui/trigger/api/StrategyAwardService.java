package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.StrategyAwardRequestDTO;
import com.yuhui.trigger.api.dto.res.StrategyAwardResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface StrategyAwardService {
    BaseResponse<List<StrategyAwardResponseDTO>> queryStrategyAward();
    BaseResponse<Boolean> addStrategyAward(StrategyAwardRequestDTO request);
    BaseResponse<Boolean> updateStrategyAward(StrategyAwardRequestDTO request);
    BaseResponse<Boolean> deleteStrategyAward(Long strategyAwardId);
}
