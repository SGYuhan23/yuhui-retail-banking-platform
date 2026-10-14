package com.yuhui.marketing.participation.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 活动状态值对象
 */
@Getter
@AllArgsConstructor
public enum ActivityStateVO {
    create("create", "创建"),
    open("open", "开启"),
    close("close", "关闭");
    private final String code;
    private final String desc;
}
