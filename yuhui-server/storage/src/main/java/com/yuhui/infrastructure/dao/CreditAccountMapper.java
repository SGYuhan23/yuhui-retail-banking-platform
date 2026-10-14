package com.yuhui.infrastructure.dao;

import com.yuhui.infrastructure.dao.po.CreditAccount;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**

* @description 针对表【credit_account(积分账户表)】的数据库操作Mapper
*/
@Mapper
public interface CreditAccountMapper extends BaseMapper<CreditAccount> {

    int update(CreditAccount creditAccount);
    int reduce(CreditAccount creditAccount);
}

