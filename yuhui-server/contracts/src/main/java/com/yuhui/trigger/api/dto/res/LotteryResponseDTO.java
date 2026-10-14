package com.yuhui.trigger.api.dto.res;

import lombok.Builder;
import lombok.Data;

/**

 * 执行抽奖，出参
 */
@Data
@Builder
public class LotteryResponseDTO {
    // 奖品ID
    private Long awardId;
    // 排序编号【策略奖品配置的奖品顺序编号】
    private Integer awardIndex;
}
