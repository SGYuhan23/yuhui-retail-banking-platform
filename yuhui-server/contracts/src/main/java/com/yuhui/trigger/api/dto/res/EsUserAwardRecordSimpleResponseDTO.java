package com.yuhui.trigger.api.dto.res;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

/**
 * 用户中奖记录简化DTO - 返回用户ID、奖品ID、奖品标题、中奖时间

 */
@Data
public class EsUserAwardRecordSimpleResponseDTO {
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
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private Date awardTime;
}
