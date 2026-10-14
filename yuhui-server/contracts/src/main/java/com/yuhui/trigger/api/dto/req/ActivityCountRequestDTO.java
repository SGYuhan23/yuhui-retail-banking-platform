package com.yuhui.trigger.api.dto.req;

import lombok.Data;

@Data
public class ActivityCountRequestDTO {
    private Long id;

    /**
     * 总次数
     */
    private Integer totalCount;

    /**
     * 日次数
     */
    private Integer dayCount;

    /**
     * 月次数
     */
    private Integer monthCount;
}
