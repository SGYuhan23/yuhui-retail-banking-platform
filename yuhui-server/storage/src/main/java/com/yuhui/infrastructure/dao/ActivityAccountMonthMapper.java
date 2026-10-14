package com.yuhui.infrastructure.dao;

import cn.bugstack.middleware.db.router.annotation.DBRouter;
import com.yuhui.infrastructure.dao.po.ActivityAccountMonth;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**

* @description 针对表【activity_account_month(抽奖活动账户表-月次数)】的数据库操作Mapper
*/
@Mapper
public interface ActivityAccountMonthMapper extends BaseMapper<ActivityAccountMonth> {

    @DBRouter
    @Select("select * from activity_account_month where user_id = #{userId} and activity_id = #{activityId} and month = #{month}")
    ActivityAccountMonth queryActivityAccountMonthByUserId(ActivityAccountMonth activityAccountMonth);

    int updateAccount(ActivityAccountMonth activityAccountMonth);
}

