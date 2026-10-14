package com.yuhui.infrastructure.es;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuhui.infrastructure.es.po.EsTask;
import org.apache.ibatis.annotations.Mapper;

/**

 * @description 针对表【task(任务表，发送MQ)】的数据库操作Mapper
 */
@Mapper
public interface EsTaskMapper extends BaseMapper<EsTask> {

}

