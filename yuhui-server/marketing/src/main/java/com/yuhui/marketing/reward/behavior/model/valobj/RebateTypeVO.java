package com.yuhui.marketing.reward.behavior.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 返利类型
 */
@Getter
@AllArgsConstructor
public enum RebateTypeVO {
    SKU("sku", "签到获得抽奖次数"),
    COUNT("count", "抽奖获得抽奖次数"),
    INTEGRAL("integral", "签到获得积分"),
    LOTTERY("lottery", "抽奖获得积分")
    ;
    private final String code;
    private final String desc;
}
