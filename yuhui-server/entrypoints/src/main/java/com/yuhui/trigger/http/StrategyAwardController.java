package com.yuhui.trigger.http;


import com.yuhui.marketing.raffle.service.armory.StrategyArmory;
import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.StrategyAwardVO;
import com.yuhui.trigger.api.StrategyAwardService;
import com.yuhui.trigger.api.dto.req.StrategyAwardRequestDTO;
import com.yuhui.trigger.api.dto.res.StrategyAwardResponseDTO;
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
@RequestMapping("/erp/strategy/award")
public class StrategyAwardController implements StrategyAwardService {
    @Resource
    private ErpRepository repository;
    @Resource
    private StrategyArmory strategyArmory;

    @Override
    @GetMapping("/query_strategy_award")
    public BaseResponse<List<StrategyAwardResponseDTO>> queryStrategyAward() {
        log.info("======================[ErpOperateController-queryStrategyAward]运营端 查询策略奖品开始 ======================");
        List<StrategyAwardVO> strategyAwards = repository.queryStrategyAwardVOList();
        List<StrategyAwardResponseDTO> list = com.yuhui.types.model.BeanProjection.list(strategyAwards, StrategyAwardResponseDTO::new);
        log.info("======================[ErpOperateController-queryStrategyAward]运营端 策略奖品查询成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_strategy_award")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY,Constants.RedisKey.ACTIVITY_AWARD_COUNT_KEY,Constants.RedisKey.ACTIVITY_AWARD_KEY})
    public BaseResponse<Boolean> addStrategyAward(@RequestBody StrategyAwardRequestDTO request) {
        log.info("======================[ErpOperateController-addStrategyAward]运营端 添加策略奖品开始 ======================");
        if (StringUtils.isBlank(request.getAwardTitle()) || request.getAwardCount() == null ||
                request.getAwardCountSurplus() == null || request.getAwardRate() == null ||
                request.getActivityId() == null || request.getAwardId() == null ||
                request.getSort() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        StrategyAwardVO strategyAwardVO = new StrategyAwardVO();
        BeanUtils.copyProperties(request, strategyAwardVO);
        repository.addStrategyAwardVO(strategyAwardVO);
        strategyArmory.assembleLotteryStrategyByActivityId(request.getActivityId());
        log.info("======================[ErpOperateController-addStrategyAward]运营端 添加策略奖品成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/update_strategy_award")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY,Constants.RedisKey.ACTIVITY_AWARD_COUNT_KEY,Constants.RedisKey.ACTIVITY_AWARD_KEY})
    public BaseResponse<Boolean> updateStrategyAward(@RequestBody StrategyAwardRequestDTO request) {
        log.info("======================[ErpOperateController-updateStrategyAward]运营端 修改策略奖品开始 ======================");
        if (StringUtils.isBlank(request.getAwardTitle()) || request.getAwardCount() == null ||
                request.getAwardCountSurplus() == null || request.getAwardRate() == null ||
                request.getActivityId() == null || request.getAwardId() == null ||
                request.getSort() == null || request.getId() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        StrategyAwardVO strategyAwardVO = new StrategyAwardVO();
        BeanUtils.copyProperties(request, strategyAwardVO);
        repository.updateStrategyAwardVO(strategyAwardVO);
        strategyArmory.assembleLotteryStrategyByActivityId(request.getActivityId());
        log.info("======================[ErpOperateController-updateStrategyAward]运营端 修改策略奖品成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/delete_strategy_award/{strategyAwardId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY,Constants.RedisKey.ACTIVITY_AWARD_COUNT_KEY,Constants.RedisKey.ACTIVITY_AWARD_KEY})
    public BaseResponse<Boolean> deleteStrategyAward(@PathVariable("strategyAwardId") Long strategyAwardId) {
        log.info("======================[ErpOperateController-deleteStrategyAward]运营端 删除策略奖品开始 ======================");
        repository.deleteStrategyAwardVO(strategyAwardId);
        log.info("======================[ErpOperateController-deleteStrategyAward]运营端 删除策略奖品成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }
}
