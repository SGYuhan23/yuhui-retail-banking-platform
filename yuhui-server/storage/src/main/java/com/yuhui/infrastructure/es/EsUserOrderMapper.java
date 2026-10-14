package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsUserOrder;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**

 * @description es查询
 */
@Mapper
public interface EsUserOrderMapper extends BaseMapper<EsUserOrder> {
    List<EsUserOrder> queryUserOrderListEs();
}

