package com.yuhui.infrastructure.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.dao.po.Award;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**

 * @description 针对表【award(奖品表)】的数据库操作Mapper
 */
@Mapper
public interface AwardMapper extends BaseMapper<Award> {

    List<Award> queryAwardList();
}

