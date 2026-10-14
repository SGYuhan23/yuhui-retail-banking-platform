package com.yuhui.infrastructure.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.dao.po.Rule;
import org.apache.ibatis.annotations.Mapper;

/**

 * @description 针对表【rule(规则表)】的数据库操作Mapper
 */
@Mapper
public interface RuleMapper extends BaseMapper<Rule> {

}

