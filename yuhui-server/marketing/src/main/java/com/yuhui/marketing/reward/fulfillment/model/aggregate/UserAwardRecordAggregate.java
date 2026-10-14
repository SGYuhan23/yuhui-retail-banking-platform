package com.yuhui.marketing.reward.fulfillment.model.aggregate;

import com.yuhui.marketing.reward.fulfillment.model.entity.TaskEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;
import lombok.Data;

/**

 * 奖品领域聚合对象
 */
@Data
public class UserAwardRecordAggregate {
    private UserAwardRecordEntity userAwardRecordEntity;
    private TaskEntity taskEntity;
}
