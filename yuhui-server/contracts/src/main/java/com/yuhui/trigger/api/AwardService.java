package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.AwardRequestDTO;
import com.yuhui.trigger.api.dto.res.AwardResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

public interface AwardService {
    BaseResponse<List<AwardResponseDTO>> queryAward();
    BaseResponse<Boolean> addAward(AwardRequestDTO request);
    BaseResponse<Boolean> updateAward(AwardRequestDTO request);
    BaseResponse<Boolean> deleteAward(Long awardId);
}
