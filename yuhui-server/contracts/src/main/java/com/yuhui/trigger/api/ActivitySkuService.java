package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.ActivitySkuRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivitySkuResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface ActivitySkuService {
    BaseResponse<List<ActivitySkuResponseDTO>> queryActivitySku();

    BaseResponse<Boolean> addActivitySku(ActivitySkuRequestDTO request);

    BaseResponse<Boolean> updateActivitySku(ActivitySkuRequestDTO request);

    BaseResponse<Boolean> deleteActivitySku(Long activitySkuId);
}
