package com.yuhui.marketing.points.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 任务状态枚举值对象
 */

@Getter
@AllArgsConstructor
public enum TaskStateVO {
    create("create", "创建"),
    complete("complete", "发送完成"),
    fail("fail", "发送失败"),
    ;
    private final String code;
    private final String desc;
}
