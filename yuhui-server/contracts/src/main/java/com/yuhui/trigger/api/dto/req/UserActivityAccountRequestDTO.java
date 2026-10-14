package com.yuhui.trigger.api.dto.req;

import lombok.Data;

/**

 * 查询账户额度，入参
 */
@Data
public class UserActivityAccountRequestDTO {
    private String userId;
    private Long activityId;
}
