package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.RuleTreeNodeLineRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleTreeNodeLineResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface RuleTreeNodeLineService {
    BaseResponse<List<RuleTreeNodeLineResponseDTO>> queryRuleTreeNodeLine();
    BaseResponse<Boolean> addRuleTreeNodeLine(RuleTreeNodeLineRequestDTO request);
    BaseResponse<Boolean> updateRuleTreeNodeLine(RuleTreeNodeLineRequestDTO request);
    BaseResponse<Boolean> deleteRuleTreeNodeLine(Long ruleTreeNodeLineId);
}
