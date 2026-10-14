package com.yuhui.marketing.participation.model.entity;

import com.yuhui.marketing.participation.model.valobj.ActivityStateVO;
import lombok.Data;

import java.util.Date;

/**

 * 活动实体对象
 */
@Data
public class ActivityEntity {
    /**
     * 活动ID
     */
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
    private Date beginDateTime;

    /**
     * 结束时间
     */
    private Date endDateTime;

    /**
     * 抽奖策略ID
     */
    private Long strategyId;

    /**
     * 活动状态
     */
    private ActivityStateVO state;

}
