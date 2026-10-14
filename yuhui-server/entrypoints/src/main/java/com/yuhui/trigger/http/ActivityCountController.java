package com.yuhui.trigger.http;


import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.ActivityCountVO;
import com.yuhui.trigger.api.ActivityCountService;
import com.yuhui.trigger.api.dto.req.ActivityCountRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivityCountResponseDTO;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixAsync;
import com.yuhui.types.annotation.PermissionCheck;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import com.yuhui.types.model.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/erp/activity_count")
public class ActivityCountController implements ActivityCountService {
    @Resource
    private ErpRepository repository;

    @Override
    @GetMapping("/query_activity_count")
    public BaseResponse<List<ActivityCountResponseDTO>> queryActivityCount() {
        log.info("======================[ActivityCountController-queryActivityCount]运营端 查询活动次数配置开始 ======================");
        List<ActivityCountVO> activityCounts = repository.queryActivityCountVOList();
        List<ActivityCountResponseDTO> list = com.yuhui.types.model.BeanProjection.list(activityCounts, ActivityCountResponseDTO::new);
        log.info("======================[ActivityCountController-queryActivityCount]运营端 查询活动次数配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_activity_count")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.ACTIVITY_COUNT_KEY)
    public BaseResponse<Boolean> addActivityCount(@RequestBody ActivityCountRequestDTO request) {
        // 1. 参数校验
        if (request.getDayCount() == null || request.getMonthCount() == null || request.getTotalCount() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        log.info("======================[ActivityCountController-addActivityCount]运营端 添加活动次数配置开始 ======================");
        ActivityCountVO activityCountVO = new ActivityCountVO();
        BeanUtils.copyProperties(request, activityCountVO);
        repository.addActivityCountVO(activityCountVO);
        log.info("======================[ActivityCountController-addActivityCount]运营端 添加活动次数配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @PostMapping("/update_activity_count")
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.ACTIVITY_COUNT_KEY)
    public BaseResponse<Boolean> updateActivityCount(@RequestBody ActivityCountRequestDTO request) {
        // 1. 参数校验
        if (request.getDayCount() == null || request.getMonthCount() == null || request.getTotalCount() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        log.info("======================[ActivityCountController-updateActivityCount]运营端 修改活动次数配置开始 ======================");
        ActivityCountVO activityCountVO = new ActivityCountVO();
        BeanUtils.copyProperties(request, activityCountVO);
        repository.updateActivityCountVO(activityCountVO);
        log.info("======================[ActivityCountController-updateActivityCount]运营端 添加活动次数配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @PostMapping("/delete_activity_count/{activityCountId}")
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.ACTIVITY_COUNT_KEY)
    public BaseResponse<Boolean> deleteActivityCount(@PathVariable("activityCountId") Long activityCountId) {
        log.info("======================[ActivityCountController-deleteActivityCount]运营端 删除活动次数配置开始 ======================");
        repository.deleteActivityCountVO(activityCountId);
        log.info("======================[ActivityCountController-deleteActivityCount]运营端 删除活动次数配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }
}
