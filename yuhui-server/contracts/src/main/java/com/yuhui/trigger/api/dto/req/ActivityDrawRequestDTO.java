package com.yuhui.trigger.api.dto.req;

import lombok.Data;

import java.io.Serializable;

/**

 * 活动抽奖请求对象
 */
@Data
public class ActivityDrawRequestDTO implements Serializable {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
}
