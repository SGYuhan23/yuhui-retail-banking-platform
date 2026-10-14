package com.yuhui.infrastructure.dao;

import cn.bugstack.middleware.db.router.annotation.DBRouterStrategy;
import com.yuhui.infrastructure.dao.po.CreditRecord;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**

* @description 针对表【user_record(用户积分订单记录)】的数据库操作Mapper
*/
@Mapper
@DBRouterStrategy(splitTable = true)
public interface CreditRecordMapper extends BaseMapper<CreditRecord> {

}

