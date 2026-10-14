package com.yuhui.trigger.http;


import com.yuhui.marketing.raffle.service.armory.StrategyArmory;
import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.StrategyVO;
import com.yuhui.trigger.api.StrategyService;
import com.yuhui.trigger.api.dto.req.StrategyRequestDTO;
import com.yuhui.trigger.api.dto.res.StrategyResponseDTO;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixAsync;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixSync;
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
@RequestMapping("/erp/strategy")
public class StrategyController implements StrategyService {
    @Resource
    private ErpRepository repository;
    @Resource
    private StrategyArmory strategyArmory;

    @Override
    @GetMapping("/query_strategy")
    public BaseResponse<List<StrategyResponseDTO>> queryStrategy() {
        log.info("======================[StrategyController-queryStrategy]运营端 查询策略开始 ======================");
        List<StrategyVO> strategys = repository.queryStrategyVOList();
        List<StrategyResponseDTO> list = com.yuhui.types.model.BeanProjection.list(strategys, StrategyResponseDTO::new);
        log.info("======================[StrategyController-queryStrategy]运营端 策略列表查询成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_strategy")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.STRATEGY_KEY})
    @DeleteOldCacheWithPrefixSync(key = {Constants.RedisKey.RATE_RANGE_KEY,Constants.RedisKey.RATE_TABLE_KEY},keyParam = "#request.id")
    public BaseResponse<Boolean> addStrategy(@RequestBody StrategyRequestDTO request) {
        log.info("======================[StrategyController-addStrategy]运营端 添加策略开始 ======================");
        // 1. 参数校验
        if (StringUtils.isBlank(request.getStrategyDesc())) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        StrategyVO strategyVO = new StrategyVO();
        BeanUtils.copyProperties(request, strategyVO);
        repository.addStrategyVO(strategyVO);
        log.info("======================[StrategyController-addStrategy]运营端 添加策略成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/update_strategy")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.STRATEGY_KEY})
    @DeleteOldCacheWithPrefixSync(key = {Constants.RedisKey.RATE_RANGE_KEY,Constants.RedisKey.RATE_TABLE_KEY},keyParam = "#request.id")
    public BaseResponse<Boolean> updateStrategy(@RequestBody StrategyRequestDTO request) {
        log.info("======================[StrategyController-updateStrategy]运营端 修改策略开始 ======================");
        // 1. 参数校验
        if (StringUtils.isBlank(request.getStrategyDesc())  || request.getId() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        StrategyVO strategyVO = new StrategyVO();
        BeanUtils.copyProperties(request, strategyVO);
        repository.updateStrategyVO(strategyVO);
        // 2. 装配抽奖算法
        strategyArmory.assembleLotteryStrategy(request.getId());
        log.info("[StrategyController-updateStrategy]装配抽奖算法成功");
        log.info("======================[StrategyController-updateStrategy]运营端 修改策略成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/delete_strategy/{strategyId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
//    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.STRATEGY_KEY})
//    @DeleteOldCacheWithPrefixSync(key = {Constants.RedisKey.RATE_RANGE_KEY,Constants.RedisKey.RATE_TABLE_KEY},keyParam = "#request.id")
    public BaseResponse<Boolean> deleteStrategy(@PathVariable("strategyId") Long strategyId) {
        log.info("======================[StrategyController-deleteStrategy]运营端 删除策略开始 ======================");
        repository.deleteStrategyVO(strategyId);
        log.info("======================[StrategyController-deleteStrategy]运营端 删除策略成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }
}
