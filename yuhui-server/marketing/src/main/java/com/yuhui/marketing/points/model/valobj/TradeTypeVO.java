package com.yuhui.marketing.points.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 交易类型值对象
 */
@Getter
@AllArgsConstructor
public enum TradeTypeVO {
    FORWARD("forward", "增加积分"),
    REVERSE("reverse", "扣减积分"),
    ;
    private final String code;
    private final String desc;
}
