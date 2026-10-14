package com.yuhui.trigger.api;


import com.yuhui.trigger.api.dto.req.DCCRequestDTO;
import com.yuhui.types.model.BaseResponse;

/**

 * DCC 动态配置中心
 */
public interface DCCService {
    BaseResponse<Boolean> updateConfig(DCCRequestDTO requestDTO);
    BaseResponse<String> queryConfig(String key);
}
