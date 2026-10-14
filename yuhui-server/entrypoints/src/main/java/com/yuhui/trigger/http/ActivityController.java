package com.yuhui.trigger.http;

import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.ActivityVO;
import com.yuhui.trigger.api.ActivityService;
import com.yuhui.trigger.api.dto.req.ActivityRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivityResponseDTO;
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
@RequestMapping("/erp/activity")
public class ActivityController implements ActivityService {
    @Resource
    private ErpRepository repository;
    @Override
    @GetMapping("/query_activity")
    public BaseResponse<List<ActivityResponseDTO>> queryActivity() {
        log.info("======================[ActivityController-queryActivity]运营端 查询活动开始 ======================");
        List<ActivityVO> activitys = repository.queryActivityVOList();
        List<ActivityResponseDTO> list = com.yuhui.types.model.BeanProjection.list(activitys, ActivityResponseDTO::new);
        log.info("======================[ActivityController-queryActivity]运营端 查询活动成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_activity")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.ACTIVITY_KEY)
    public BaseResponse<Boolean> addActivity(@RequestBody ActivityRequestDTO request) {
        log.info("======================[ActivityController-add]运营端 添加活动开始 ======================");
        // 1. 参数校验
        if (StringUtils.isBlank(request.getActivityName()) || StringUtils.isBlank(request.getActivityDesc()) ||
                request.getStrategyId() == null || request.getBeginDateTime() == null ||
                request.getEndDateTime() == null || request.getState() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        ActivityVO activityVO = new ActivityVO();
        BeanUtils.copyProperties(request, activityVO);
        repository.addActivityVO(activityVO);
        log.info("======================[ActivityController-add]运营端 添加活动成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/update_activity")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.ACTIVITY_KEY)
    public BaseResponse<Boolean> updateActivity(@RequestBody ActivityRequestDTO request) {
        log.info("======================[ActivityController-update]运营端 修改活动开始 ======================");
        // 1. 参数校验
        if (StringUtils.isBlank(request.getActivityName()) || StringUtils.isBlank(request.getActivityDesc()) ||
                request.getStrategyId() == null || request.getBeginDateTime() == null ||
                request.getEndDateTime() == null || request.getState() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        ActivityVO activityVO = new ActivityVO();
        BeanUtils.copyProperties(request, activityVO);
        repository.updateActivityVO(activityVO);
        log.info("======================[ActivityController-update]运营端 修改活动成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/delete_activity/{activityId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = Constants.RedisKey.ACTIVITY_KEY)
    public BaseResponse<Boolean> deleteActivity(@PathVariable("activityId") Long activityId) {
        log.info("======================[ActivityController-delete]运营端 删除活动开始 ======================");
        repository.deleteActivityVO(activityId);
        log.info("======================[ActivityController-delete]运营端 删除活动成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }
}
