package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsActivityAccount;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**

 * @description 针对表【activity_account(抽奖活动账户表)】的数据库操作Mapper
 */
@Mapper
public interface EsActivityAccountMapper extends BaseMapper<EsActivityAccount> {

    List<EsActivityAccount> queryActivityAccountListEs();
}

