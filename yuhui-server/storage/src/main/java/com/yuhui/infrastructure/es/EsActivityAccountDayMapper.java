package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsActivityAccountDay;
import org.apache.ibatis.annotations.Mapper;

/**

 * @description 针对表【activity_account_day(抽奖活动账户表-日次数)】的数据库操作Mapper
 */
@Mapper
public interface EsActivityAccountDayMapper extends BaseMapper<EsActivityAccountDay> {

}

