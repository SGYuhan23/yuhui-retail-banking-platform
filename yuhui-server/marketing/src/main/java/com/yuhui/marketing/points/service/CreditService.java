package com.yuhui.marketing.points.service;

import com.yuhui.marketing.points.model.entity.CreditAccountEntity;
import com.yuhui.marketing.points.model.entity.TradeEntity;

/**

 * 积分领域接口
 */
public interface CreditService {
    /**
     * 创建积分额度单
     * @param tradeEntity 交易实体对象
     * @return 单号
     */
    String createCreditOrder(TradeEntity tradeEntity);

    /**
     * 查询用户积分
     * @param userId 用户id
     * @return CreditAccountEntity
     */
    CreditAccountEntity queryUserCreditAccount(String userId,Long activityId);
}
