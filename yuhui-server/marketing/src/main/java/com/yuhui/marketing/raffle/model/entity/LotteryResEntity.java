package com.yuhui.marketing.raffle.model.entity;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

/**

 * 抽奖响应实体
 */
@Data
@Builder
public class LotteryResEntity {

    /**
     * 抽奖奖品ID
     */
    private Long awardId;

    /**
     * 中奖时间
     */
    private Date awardTime;

    /**
     * 奖品名称
     */
    private String awardTitle;

    /**
     * 奖品配置信息
     */
    private String awardConfig;

    /**
     * 奖品顺序号
     */
    private Integer sort;

}
