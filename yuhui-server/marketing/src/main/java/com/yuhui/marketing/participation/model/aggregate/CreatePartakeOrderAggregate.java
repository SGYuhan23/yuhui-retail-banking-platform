package com.yuhui.marketing.participation.model.aggregate;

import com.yuhui.marketing.participation.model.entity.ActivityAccountDayEntity;
import com.yuhui.marketing.participation.model.entity.ActivityAccountEntity;
import com.yuhui.marketing.participation.model.entity.ActivityAccountMonthEntity;
import com.yuhui.marketing.participation.model.entity.PartakeOrderResEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**

 * 抽奖单聚合对象
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreatePartakeOrderAggregate {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 活动ID
     */
    private Long activityId;
    /**
     * 账户总额度
     */
    private ActivityAccountEntity activityAccountEntity;
    /**
     * 是否存在月账户
     */
    private boolean isExistAccountMonth = true;
    /**
     * 账户月额度
     */
    private ActivityAccountMonthEntity activityAccountMonthEntity;
    /**
     * 是否存在日账户
     */
    private boolean isExistAccountDay = true;
    /**
     * 账户日额度
     */
    private ActivityAccountDayEntity activityAccountDayEntity;
    /**
     * 抽奖订单实体
     */
    private PartakeOrderResEntity partakeOrderResEntity;
}
