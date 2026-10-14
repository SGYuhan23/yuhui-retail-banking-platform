package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsActivityAccountMonth;
import org.apache.ibatis.annotations.Mapper;

/**

 * @description 针对表【activity_account_month(抽奖活动账户表-月次数)】的数据库操作Mapper
 */
@Mapper
public interface EsActivityAccountMonthMapper extends BaseMapper<EsActivityAccountMonth> {

}

