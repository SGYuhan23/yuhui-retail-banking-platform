package com.yuhui.trigger.api.dto.res;

import lombok.Data;

/**

 * 查询抽奖奖品列表，出参
 */
@Data
public class LotteryAwardListResponseDTO {
    // 奖品ID
    private Long awardId;
    // 奖品标题
    private String awardTitle;
    // 奖品副标题【抽奖1次后解锁】
    private String awardSubtitle;
    // 奖品图片
    private String image;
    // 排序编号
    private Integer sort;
    // 奖品次数规则 - 抽奖N次后解锁，未配置则为空
    private Integer awardRuleLockCount;
    // 奖品是否解锁 - true 已解锁、false 未解锁
    private Boolean isAwardUnlock;
    // 还需要多少次解锁
    private Integer waitUnLockCount;
}
