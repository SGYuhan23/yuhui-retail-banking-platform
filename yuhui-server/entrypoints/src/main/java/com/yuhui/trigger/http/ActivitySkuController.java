package com.yuhui.trigger.http;


import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.ActivitySkuVO;
import com.yuhui.trigger.api.ActivitySkuService;
import com.yuhui.trigger.api.dto.req.ActivitySkuRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivitySkuResponseDTO;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixAsync;
import com.yuhui.types.annotation.PermissionCheck;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.model.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/erp/activity_sku")
public class ActivitySkuController implements ActivitySkuService {
    @Resource
    private ErpRepository repository;


    @Override
    @GetMapping("/query_activity_sku")
    public BaseResponse<List<ActivitySkuResponseDTO>> queryActivitySku() {
        log.info("======================[ActivitySkuController-queryActivitySku]运营端 查询活动sku配置开始 ======================");
        List<ActivitySkuVO> activitySkus = repository.queryActivitySkuVOList();
        List<ActivitySkuResponseDTO> list = com.yuhui.types.model.BeanProjection.list(activitySkus, ActivitySkuResponseDTO::new);
        log.info("======================[ActivitySkuController-queryActivitySku]运营端 查询活动sku配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @PostMapping("/add_activity_sku")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.ACTIVITY_SKU_LIST_KEY,Constants.RedisKey.ACTIVITY_SKU_STOCK_COUNT_KEY})
    public BaseResponse<Boolean> addActivitySku(@RequestBody ActivitySkuRequestDTO request) {
        log.info("======================[ActivitySkuController-addActivitySku]运营端 添加活动sku配置开始 ======================");
        ActivitySkuVO activitySkuVO = new ActivitySkuVO();
        BeanUtils.copyProperties(request, activitySkuVO);
        repository.addActivitySkuVO(activitySkuVO);
        log.info("======================[ActivitySkuController-addActivitySku]运营端 添加活动sku配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/update_activity_sku")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.ACTIVITY_SKU_LIST_KEY,Constants.RedisKey.ACTIVITY_SKU_STOCK_COUNT_KEY})
    public BaseResponse<Boolean> updateActivitySku(@RequestBody ActivitySkuRequestDTO request) {
        log.info("======================[ActivitySkuController-updateActivitySku]运营端 修改活动sku配置开始 ======================");
        ActivitySkuVO activitySkuVO = new ActivitySkuVO();
        BeanUtils.copyProperties(request, activitySkuVO);
        repository.updateActivitySkuVO(activitySkuVO);
        log.info("======================[ActivitySkuController-updateActivitySku]运营端 添加活动sku配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @Override
    @PostMapping("/delete_activity_sku/{activitySkuId}")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixAsync(key = {Constants.RedisKey.ACTIVITY_SKU_LIST_KEY,Constants.RedisKey.ACTIVITY_SKU_STOCK_COUNT_KEY})
    public BaseResponse<Boolean> deleteActivitySku(@PathVariable("activitySkuId") Long activitySkuId) {
        log.info("======================[ActivitySkuController-deleteActivitySku]运营端 删除活动sku配置开始 ======================");
        repository.deleteActivitySkuVO(activitySkuId);
        log.info("======================[ActivitySkuController-deleteActivitySku]运营端 删除活动sku配置成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }
}
