package com.yuhui.marketing.reward.fulfillment.model.entity;

import com.yuhui.marketing.reward.fulfillment.model.valobj.AwardStateVO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAwardRecordEntity {
    private Long id;
    /**
     * 用户ID
     */
    private String userId;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 抽奖策略ID
     */
    private Long strategyId;

    /**
     * 抽奖订单ID【作为幂等使用】
     */
    private Long userOrderId;

    /**
     * 奖品ID
     */
    private Long awardId;

    /**
     * 奖品标题（名称）
     */
    private String awardTitle;

    /**
     * 中奖时间
     */
    private Date awardTime;

    /**
     * 奖品状态；create-创建、completed-发奖完成、fail-发奖失败
     */
    private AwardStateVO awardState;

    /**
     * 奖品配置信息；发奖的时候，可以根据
     */
    private String awardConfig;

}
