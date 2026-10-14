package com.yuhui.marketing.participation.model.entity;

import com.yuhui.marketing.participation.model.valobj.OrderTradeTypeVO;
import lombok.Data;

/**

 * 创建额度单请求体
 */
@Data
public class QuotaOrderEntity {
    /** 用户ID */
    private String userId;
    /** 活动ID */
    private Long activityId;
    /** 商品SKU - activity + activity count */
    private Long sku;
    /** 幂等业务单号，外部谁充值谁透传，这样来保证幂等（多次调用也能确保结果唯一，不会多次充值）。 */
    private String outBusinessNo;
    /** 订单类型 */
    private OrderTradeTypeVO orderTradeTypeVO = OrderTradeTypeVO.rebate_no_pay_trade;
    /** 返利配置 */
    private String rebateConfig;
}
