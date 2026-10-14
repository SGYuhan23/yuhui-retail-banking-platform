package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.ActivityRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivityResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface ActivityService {
    BaseResponse<List<ActivityResponseDTO>> queryActivity();
    BaseResponse<Boolean> addActivity(ActivityRequestDTO request);
    BaseResponse<Boolean> updateActivity(ActivityRequestDTO request);
    BaseResponse<Boolean> deleteActivity(Long activityId);
}
