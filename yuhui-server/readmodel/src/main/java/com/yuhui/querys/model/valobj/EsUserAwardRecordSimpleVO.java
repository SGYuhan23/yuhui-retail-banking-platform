package com.yuhui.querys.model.valobj;


import lombok.Data;

import java.util.Date;

/**
 * 用户中奖记录简化VO - 只包含用户ID、奖品ID、奖品标题、中奖时间

 */
@Data
public class EsUserAwardRecordSimpleVO {
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
