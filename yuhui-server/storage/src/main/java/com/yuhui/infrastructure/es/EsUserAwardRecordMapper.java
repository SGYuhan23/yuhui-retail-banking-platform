package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsUserAwardRecord;
import com.yuhui.infrastructure.es.po.EsUserAwardRecordSimple;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**

 * @description 针对表【user_award_record(用户中奖记录表)】的数据库操作Mapper
 */
@Mapper
public interface EsUserAwardRecordMapper extends BaseMapper<EsUserAwardRecord> {

    List<EsUserAwardRecord> queryUserAwardRecordVOListEs();

    List<EsUserAwardRecord> queryUserAwardRecordVOListEsByActivityId();

    List<EsUserAwardRecordSimple> queryUserAwardRecordSimpleEsByActivityId(Long activityId);
}
