package com.yuhui.infrastructure.dao;

import cn.bugstack.middleware.db.router.annotation.DBRouter;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.dao.po.ActivityAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**

* @description 针对表【activity_account(抽奖活动账户表)】的数据库操作Mapper
*/
@Mapper
public interface ActivityAccountMapper extends BaseMapper<ActivityAccount> {

    int updateAccount(ActivityAccount activityAccount);

    @DBRouter
    @Select("select * from activity_account where user_id = #{userId} and activity_id = #{activityId}")
    ActivityAccount queryActivityAccountByUserId(ActivityAccount activityAccount);
}

