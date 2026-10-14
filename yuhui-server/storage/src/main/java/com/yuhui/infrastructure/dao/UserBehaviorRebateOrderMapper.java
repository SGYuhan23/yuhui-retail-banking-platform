package com.yuhui.infrastructure.dao;

import cn.bugstack.middleware.db.router.annotation.DBRouterStrategy;
import com.yuhui.infrastructure.dao.po.UserBehaviorRebateOrder;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**

* @description 针对表【user_behavior_rebate_order_000(用户行为返利流水表)】的数据库操作Mapper
*/
@Mapper
@DBRouterStrategy(splitTable = true)
public interface UserBehaviorRebateOrderMapper extends BaseMapper<UserBehaviorRebateOrder> {

}

