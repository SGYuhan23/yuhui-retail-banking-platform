package com.yuhui.infrastructure.dao;

import cn.bugstack.middleware.db.router.annotation.DBRouter;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.dao.po.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**

* @description 针对表【task(任务表，发送MQ)】的数据库操作Mapper
*/
@Mapper
public interface TaskMapper extends BaseMapper<Task> {

    //因为前面已经进行过分库操作了，所以这里不需要 @DBRouter
    @Select("select * from task " +
            "where (state = 'fail' and update_time <= date_sub(now(), interval 5 second)) " +
            "or (state = 'create' and update_time <= date_sub(now(), interval 60 second)) " +
            "order by update_time asc limit 10")
    List<Task> queryNoSendMessageTaskList();

    @DBRouter
    @Update("update task set state = 'completed', update_time = now() where user_id = #{userId} and message_id = #{messageId}")
    void updateTaskSendMessageCompleted(Task taskReq);

    @DBRouter
    @Update("update task set state = 'fail', update_time = now() where user_id = #{userId} and message_id = #{messageId}")
    void updateTaskSendMessageFail(Task taskReq);
}

