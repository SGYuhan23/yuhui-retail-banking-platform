package com.yuhui.querys.adapter.repository;


import com.yuhui.querys.model.valobj.*;

import java.util.List;

public interface EsErpRepository {
    List<EsUserOrderVO> queryEsUserOrderVOList();

    List<EsActivityAccountVO> queryEsActivityAccountVOList();

    List<EsUserAwardRecordVO> queryEsUserAwardRecordVOList();

    List<EsUserAwardRecordVO> queryEsUserAwardRecordVOList(Long activityId);

    List<EsUserAwardRecordSimpleVO> queryUserAwardRecordSimpleEsByActivityId(Long activityId);

    List<EsCreditAccountVO> queryCreditAccountVOList();

    List<EsCreditRecordVO> queryCreditRecordVOList();

    List<EsActivityRecordVO> queryEsActivityRecordVOList();

    List<EsUserBehaviorRebateOrderVO> queryEsUserBehaviorRebateOrderVOList();

}
