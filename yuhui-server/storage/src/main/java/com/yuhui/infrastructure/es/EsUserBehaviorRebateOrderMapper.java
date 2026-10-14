package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsUserBehaviorRebateOrder;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**

 * @description 针对表【user_behavior_rebate_order_000(用户行为返利流水表)】的数据库操作Mapper
 */
@Mapper
public interface EsUserBehaviorRebateOrderMapper extends BaseMapper<EsUserBehaviorRebateOrder> {

    List<EsUserBehaviorRebateOrder> queryUserBehaviorRebateOrderVOListEs();
}

