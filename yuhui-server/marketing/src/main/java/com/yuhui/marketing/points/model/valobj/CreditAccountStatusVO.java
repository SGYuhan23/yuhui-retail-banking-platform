package com.yuhui.marketing.points.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**

 * 积分账户状态
 */
@Getter
@AllArgsConstructor
public enum CreditAccountStatusVO {
    OPEN("open","可用"),
    CLOSE("close","冻结"),
    ;
    private final String code;
    private final String desc;
}
