package com.yuhui.trigger.api.dto.req;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.yuhui.trigger.api.deserialize.MultiFormatDateDeserializer;
import lombok.Data;

import java.util.Date;

/**
 * 抽奖活动表
 *

 * @TableName activity
 */
@Data
public class ActivityRequestDTO {
    private Long id;

    /**
     * 活动名称
     */
    private String activityName;

    /**
     * 活动描述
     */
    private String activityDesc;

    /**
     * 开始时间
     */
    @JsonDeserialize(using = MultiFormatDateDeserializer.class)
    private Date beginDateTime;

    /**
     * 结束时间
     */
    @JsonDeserialize(using = MultiFormatDateDeserializer.class)
    private Date endDateTime;

    /**
     * 抽奖策略ID
     */
    private Long strategyId;

    /**
     * 活动状态
     */
    private String state;

}
