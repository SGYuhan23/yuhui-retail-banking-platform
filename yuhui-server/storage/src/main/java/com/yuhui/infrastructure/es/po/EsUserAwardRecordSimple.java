package com.yuhui.infrastructure.es.po;

import lombok.Data;

import java.util.Date;

/**
 * 用户中奖记录简化PO - 只包含用户ID、奖品ID、奖品标题、中奖时间
 *

 */
@Data
public class EsUserAwardRecordSimple {

    /**
     * 用户ID
     */
    private String userId;

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

}
