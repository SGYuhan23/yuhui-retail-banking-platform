package com.yuhui.marketing.participation.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 交易类型值对象
 */
@Getter
@AllArgsConstructor
public enum OrderTradeTypeVO {
    credit_pay_trade("credit_pay_trade", "积分兑换，需要支付"),
    rebate_no_pay_trade("rebate_no_pay_trade", "签到返利奖品，不需要支付"),
    gift_no_pay_trade("gift_no_pay_trade", "活动赠送，不需要支付"),
    ;

    private final String code;
    private final String desc;

}
