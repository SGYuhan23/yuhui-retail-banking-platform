package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.res.*;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

/**

 * 运营后台数据接口
 */
public interface ErpOperateService {
    BaseResponse<List<EsUserOrderResponseDTO>> queryUserOrder();
    BaseResponse<List<EsActivityAccountResponseDTO>> queryActivityAccount();
    BaseResponse<List<EsUserAwardRecordResponseDTO>> queryUserAwardRecord();
    BaseResponse<List<EsUserAwardRecordSimpleResponseDTO>> queryUserAwardRecordByActivityId(Long activityId);
    BaseResponse<List<EsCreditAccountResponseDTO>> queryCreditAccount();
    BaseResponse<List<EsCreditRecordResponseDTO>> queryCreditRecord();
    BaseResponse<List<EsActivityRecordResponseDTO>> queryActivityRecord();
    BaseResponse<List<EsUserBehaviorRebateOrderResponseDTO>> queryUserBehaviorRebateOrder();
}
