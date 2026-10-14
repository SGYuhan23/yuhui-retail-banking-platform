package com.yuhui.marketing.participation.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 订单状态值对象
 */
@Getter
@AllArgsConstructor
public enum OrderStateVO {
    wait_pay("wait_pay","待支付"),
    complete("complete", "完成");

    private final String code;
    private final String desc;

}
