package com.yuhui.marketing.participation.service.armory;

/**

 * 活动-装配领域-装配接口
 */
public interface ActivityArmory {

//    /**
//     * 活动sku装配
//     * @param sku sku
//     * @return t/f
//     */
//    boolean assembleActivitySku(Long sku);

    /**
     * 活动sku装配
     * @param activityId 活动id
     * @return t/f
     */
    void assembleActivitySkuByActivityId(Long activityId);
}
