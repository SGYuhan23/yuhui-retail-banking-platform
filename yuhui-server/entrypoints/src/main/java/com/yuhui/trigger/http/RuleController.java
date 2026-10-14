package com.yuhui.trigger.http;


import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.RuleVO;
import com.yuhui.trigger.api.RuleService;
import com.yuhui.trigger.api.dto.req.RuleRequestDTO;
import com.yuhui.trigger.api.dto.res.RuleResponseDTO;
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
@RequestMapping("/erp/rule")
public class RuleController implements RuleService {
    @Resource
    private ErpRepository repository;

    @Override
    @GetMapping("/query_rule")
    public BaseResponse<List<RuleResponseDTO>> queryRule() {
        log.info("======================[ErpOperateController-queryRule]运营端 查询策略规则开始 ======================");
        List<RuleVO> rules = repository.queryRuleVOList();
        List<RuleResponseDTO> list = com.yuhui.types.model.BeanProjection.list(rules, RuleResponseDTO::new);
        log.info("======================[ErpOperateController-queryRule]运营端 查询策略规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_rule")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.STRATEGY_RULE_WEIGHT_KEY)
    public BaseResponse<Boolean> addRule(@RequestBody RuleRequestDTO request) {
        log.info("======================[ErpOperateController-addRule]运营端 添加策略规则开始 ======================");
        if (StringUtils.isBlank(request.getRuleModel()) || StringUtils.isBlank(request.getRuleValue()) || StringUtils.isBlank(request.getRuleDesc())) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleVO ruleVO = new RuleVO();
        BeanUtils.copyProperties(request, ruleVO);
        repository.addRuleVO(ruleVO);
        log.info("======================[ErpOperateController-addRule]运营端 添加策略规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/update_rule")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.STRATEGY_RULE_WEIGHT_KEY)
    public BaseResponse<Boolean> updateRule(@RequestBody RuleRequestDTO request) {
        log.info("======================[ErpOperateController-updateRule]运营端 修改策略规则开始 ======================");
        if (StringUtils.isBlank(request.getRuleModel()) || StringUtils.isBlank(request.getRuleValue()) || StringUtils.isBlank(request.getRuleDesc()) || request.getId()==null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        RuleVO ruleVO = new RuleVO();
        BeanUtils.copyProperties(request, ruleVO);
        repository.updateRuleVO(ruleVO);
        log.info("======================[ErpOperateController-updateRule]运营端 添加策略规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/delete_rule/{ruleId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.STRATEGY_RULE_WEIGHT_KEY)
    public BaseResponse<Boolean> deleteRule(@PathVariable("ruleId") Long ruleId) {
        log.info("======================[ErpOperateController-deleteRule]运营端 删除策略规则开始 ======================");
        repository.deleteRuleVO(ruleId);
        log.info("======================[ErpOperateController-deleteRule]运营端 删除策略规则成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }
}
