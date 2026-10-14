package com.yuhui.infrastructure.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.dao.po.BehaviorRebate;
import org.apache.ibatis.annotations.Mapper;

/**

 * @description 针对表【behavior_rebate(返利活动配置表)】的数据库操作Mapper
 */
@Mapper
public interface BehaviorRebateMapper extends BaseMapper<BehaviorRebate> {

}

