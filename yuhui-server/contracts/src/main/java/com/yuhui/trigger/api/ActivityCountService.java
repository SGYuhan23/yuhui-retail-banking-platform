package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.ActivityCountRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivityCountResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface ActivityCountService {
    BaseResponse<List<ActivityCountResponseDTO>> queryActivityCount();
    BaseResponse<Boolean> addActivityCount(ActivityCountRequestDTO request);
    BaseResponse<Boolean> updateActivityCount(ActivityCountRequestDTO request);
    BaseResponse<Boolean> deleteActivityCount(Long activityCountId);
}
