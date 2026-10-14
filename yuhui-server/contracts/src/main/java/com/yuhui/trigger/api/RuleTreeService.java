package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.RuleTreeRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleTreeResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

/**

 * 奖品规则
 */
public interface RuleTreeService {
    BaseResponse<List<RuleTreeResponseDTO>> queryRuleTree();
    BaseResponse<Boolean> addRuleTree(RuleTreeRequestDTO request);
    BaseResponse<Boolean> updateRuleTree(RuleTreeRequestDTO request);
    BaseResponse<Boolean> deleteRuleTree(Long ruleTreeId);
}
