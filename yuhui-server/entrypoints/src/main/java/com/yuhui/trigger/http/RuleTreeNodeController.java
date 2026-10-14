package com.yuhui.trigger.http;

import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.RuleTreeNodeVO;
import com.yuhui.trigger.api.RuleTreeNodeService;
import com.yuhui.trigger.api.dto.req.RuleTreeNodeRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleTreeNodeResponseDTO;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixAsync;
import com.yuhui.types.annotation.PermissionCheck;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import com.yuhui.types.model.BaseResponse;
import io.micrometer.core.instrument.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/erp/rule/tree/node")
public class RuleTreeNodeController implements RuleTreeNodeService {
    @Resource
    private ErpRepository repository;

    @Override
    @GetMapping("/query_rule_tree_node")
    public BaseResponse<List<RuleTreeNodeResponseDTO>> queryRuleTreeNode() {
        log.info("======================[RuleTreeNodeController-queryRuleTreeNode]运营端 查询奖品规则节点开始 ======================");
        List<RuleTreeNodeVO> ruleTreeNodes = repository.queryRuleTreeNodeVO();
        List<RuleTreeNodeResponseDTO> list = com.yuhui.types.model.BeanProjection.list(ruleTreeNodes, RuleTreeNodeResponseDTO::new);
        log.info("======================[RuleTreeNodeController-queryRuleTreeNode]运营端 查询奖品规则节点成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_rule_tree_node_one")
    public BaseResponse<List<RuleTreeNodeResponseDTO>> queryRuleTreeNodeByRuleTreeId(@RequestParam String ruleTreeId) {
        log.info("======================[RuleTreeNodeController-queryRuleTreeNodeByRuleTreeId]运营端 查询奖品规则树节点开始 rule_tree_id:{} ======================",ruleTreeId);
        List<RuleTreeNodeVO> ruleTreeNodes = repository.queryRuleTreeNodeVOByRuleTreeId(ruleTreeId);
        List<RuleTreeNodeResponseDTO> list = com.yuhui.types.model.BeanProjection.list(ruleTreeNodes, RuleTreeNodeResponseDTO::new);
        log.info("======================[RuleTreeNodeController-queryRuleTreeNodeByRuleTreeId]运营端 查询奖品规则树节点成功 rule_tree_id:{} ======================",ruleTreeId);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_rule_tree_node")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.RULE_TREE_KEY)
    public BaseResponse<Boolean> addRuleTreeNode(@RequestBody RuleTreeNodeRequestDTO request) {
        log.info("======================[ErpOperateController-add]运营端 添加奖品规则节点开始 ======================");
        if (request.getRuleTreeId() == null || StringUtils.isBlank(request.getRuleName()) || StringUtils.isBlank(request.getRuleDesc())) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleTreeNodeVO ruleTreeNodeVO = new RuleTreeNodeVO();
        BeanUtils.copyProperties(request, ruleTreeNodeVO);
        repository.addRuleTreeNodeVO(ruleTreeNodeVO);
        log.info("======================[ErpOperateController-add]运营端 添加奖品规则节点成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/update_rule_tree_node")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.RULE_TREE_KEY)
    public BaseResponse<Boolean> updateRuleTreeNode(@RequestBody RuleTreeNodeRequestDTO request) {
        log.info("======================[ErpOperateController-update]运营端 修改奖品规则节点开始 ======================");
        if (request.getId() == null || StringUtils.isBlank(request.getRuleName()) || StringUtils.isBlank(request.getRuleDesc())) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleTreeNodeVO ruleTreeNodeVO = new RuleTreeNodeVO();
        BeanUtils.copyProperties(request, ruleTreeNodeVO);
        repository.updateRuleTreeNodeVO(ruleTreeNodeVO);
        log.info("======================[ErpOperateController-update]运营端 修改奖品规则节点成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/delete_rule_tree_node/{ruleTreeNodeId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.RULE_TREE_KEY)
    public BaseResponse<Boolean> deleteRuleTreeNode(@PathVariable("ruleTreeNodeId") Long ruleTreeNodeId) {
        log.info("======================[ErpOperateController-delete]运营端 删除奖品规则节点开始 ======================");
        repository.deleteRuleTreeNodeVO(ruleTreeNodeId);
        log.info("======================[ErpOperateController-delete]运营端 删除奖品规则节点成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }
}
