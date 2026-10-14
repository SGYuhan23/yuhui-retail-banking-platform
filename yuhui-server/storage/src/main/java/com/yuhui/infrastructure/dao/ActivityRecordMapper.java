package com.yuhui.infrastructure.dao;

import cn.bugstack.middleware.db.router.annotation.DBRouterStrategy;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.dao.po.ActivityRecord;
import org.apache.ibatis.annotations.Mapper;

/**

 * @description 针对表【activity_record(抽奖活动单)】的数据库操作Mapper
 */
@Mapper
@DBRouterStrategy(splitTable = true) //执行 MyBaits 操作的时候，对 SQL 语句进行动态变更。
public interface ActivityRecordMapper extends BaseMapper<ActivityRecord> {

}

