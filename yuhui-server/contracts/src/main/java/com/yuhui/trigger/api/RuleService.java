package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.RuleRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface RuleService {
    BaseResponse<List<RuleResponseDTO>> queryRule();

    BaseResponse<Boolean> addRule(RuleRequestDTO request);

    BaseResponse<Boolean> updateRule(RuleRequestDTO request);

    BaseResponse<Boolean> deleteRule(Long ruleId);
}
