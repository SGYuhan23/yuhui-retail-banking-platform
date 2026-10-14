package com.yuhui.marketing.raffle.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 规则过滤枚举
 */
@Getter
@AllArgsConstructor
public enum RuleLogicCheckTypeVO {
    ALLOW(9000, "放行"),
    TAKE_OVER(9001, "拦截");

    private final int code;
    private final String message;
}
