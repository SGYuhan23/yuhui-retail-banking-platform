package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsCreditAccount;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**

 * @description 针对表【credit_account(积分账户表)】的数据库操作Mapper
 */
@Mapper
public interface EsCreditAccountMapper extends BaseMapper<EsCreditAccount> {

    List<EsCreditAccount> queryCreditAccount();
}

