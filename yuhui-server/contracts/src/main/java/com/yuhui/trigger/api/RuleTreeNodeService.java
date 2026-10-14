package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.RuleTreeNodeRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleTreeNodeResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface RuleTreeNodeService {
    BaseResponse<List<RuleTreeNodeResponseDTO>> queryRuleTreeNode();
    BaseResponse<List<RuleTreeNodeResponseDTO>> queryRuleTreeNodeByRuleTreeId(String ruleTreeId);
    BaseResponse<Boolean> addRuleTreeNode(RuleTreeNodeRequestDTO request);
    BaseResponse<Boolean> updateRuleTreeNode(RuleTreeNodeRequestDTO request);
    BaseResponse<Boolean> deleteRuleTreeNode(Long ruleTreeNodeId);
}
