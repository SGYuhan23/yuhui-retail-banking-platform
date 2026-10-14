package com.yuhui.marketing.reward.behavior.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 行为值对象
 */

@Getter
@AllArgsConstructor
public enum BehaviorTypeVO {
    SIGN("sign", "签到（日历）"),
    OPENAI_PAY("openai_pay", "openai 外部支付完成"),
    ACTIVITY_GIFT("activity_gift", "活动赠送"),
    ;
    private final String code;
    private final String desc;
}
