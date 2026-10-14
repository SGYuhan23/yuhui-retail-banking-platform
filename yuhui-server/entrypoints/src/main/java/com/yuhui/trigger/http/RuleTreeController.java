package com.yuhui.trigger.http;


import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.RuleTreeVO;
import com.yuhui.trigger.api.RuleTreeService;
import com.yuhui.trigger.api.dto.req.RuleTreeRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleTreeResponseDTO;
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
@RequestMapping("/erp/rule/tree")
public class RuleTreeController implements RuleTreeService {
    @Resource
    private ErpRepository repository;
    @Override
    @GetMapping("/query_rule_tree")
    public BaseResponse<List<RuleTreeResponseDTO>> queryRuleTree() {
        log.info("======================[ErpOperateController-queryRuleTree]运营端 查询奖品规则开始 ======================");
        List<RuleTreeVO> ruleTrees = repository.queryRuleTreeVOList();
        List<RuleTreeResponseDTO> list = com.yuhui.types.model.BeanProjection.list(ruleTrees, RuleTreeResponseDTO::new);
        log.info("======================[ErpOperateController-queryRuleTree]运营端 查询奖品规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_rule_tree")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.RULE_TREE_KEY)
    public BaseResponse<Boolean> addRuleTree(@RequestBody RuleTreeRequestDTO request) {
        log.info("======================[ErpOperateController-add]运营端 添加奖品规则开始 ======================");
        if (StringUtils.isBlank(request.getTreeName()) || StringUtils.isBlank(request.getTreeDesc()) || StringUtils.isBlank(request.getTreeNodeRuleKey())){
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleTreeVO ruleTreeVO = new RuleTreeVO();
        BeanUtils.copyProperties(request, ruleTreeVO);
        repository.addRuleTreeVO(ruleTreeVO);
        log.info("======================[ErpOperateController-add]运营端 添加奖品规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/update_rule_tree")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.RULE_TREE_KEY)
    public BaseResponse<Boolean> updateRuleTree(@RequestBody RuleTreeRequestDTO request) {
        log.info("======================[ErpOperateController-update]运营端 修改奖品规则开始 ======================");
        if (StringUtils.isBlank(request.getTreeName()) || StringUtils.isBlank(request.getTreeDesc()) || StringUtils.isBlank(request.getTreeNodeRuleKey()) || request.getId()==null){
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleTreeVO ruleTreeVO = new RuleTreeVO();
        BeanUtils.copyProperties(request, ruleTreeVO);
        repository.updateRuleTreeVO(ruleTreeVO);
        log.info("======================[ErpOperateController-update]运营端 添加奖品规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/delete_rule_tree/{ruleTreeId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.RULE_TREE_KEY)
    public BaseResponse<Boolean> deleteRuleTree(@PathVariable("ruleTreeId") Long ruleTreeId) {
        log.info("======================[ErpOperateController-delete]运营端 删除奖品规则开始 ======================");
        repository.deleteRuleTreeVO(ruleTreeId);
        log.info("======================[ErpOperateController-delete]运营端 删除奖品规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }
}
