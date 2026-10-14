package com.yuhui.infrastructure.adapter.repository;


import com.yuhui.infrastructure.es.*;
import com.yuhui.infrastructure.es.po.*;
import com.yuhui.querys.adapter.repository.EsErpRepository;
import com.yuhui.querys.model.valobj.*;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Repository
@org.springframework.context.annotation.Profile("!local")
public class EsErpRepositoryImpl implements EsErpRepository {

    @Resource
    private EsUserOrderMapper esUserOrderMapper;
    @Resource
    private EsActivityAccountMapper esActivityAccountMapper;
    @Resource
    private EsUserAwardRecordMapper esUserAwardRecordMapper;
    @Resource
    private EsCreditAccountMapper esCreditAccountMapper;
    @Resource
    private EsCreditRecordMapper esCreditRecordMapper;
    @Resource
    private EsActivityRecordMapper esActivityRecordMapper;
    @Resource
    private EsUserBehaviorRebateOrderMapper esUserBehaviorRebateOrderMapper;


    @Override
    public List<EsUserOrderVO> queryEsUserOrderVOList() {
        List<EsUserOrder> esUserOrders = esUserOrderMapper.queryUserOrderListEs();
        ArrayList<EsUserOrderVO> list = new ArrayList<>();
        for (EsUserOrder esUserOrder : esUserOrders) {
            EsUserOrderVO esUserOrderVO = new EsUserOrderVO();
            BeanUtils.copyProperties(esUserOrder, esUserOrderVO);
            list.add(esUserOrderVO);
        }
        return list;
    }

    @Override
    public List<EsActivityAccountVO> queryEsActivityAccountVOList() {
        List<EsActivityAccount> esActivityAccounts = esActivityAccountMapper.queryActivityAccountListEs();
        ArrayList<EsActivityAccountVO> list = new ArrayList<>();
        for (EsActivityAccount esActivityAccount : esActivityAccounts) {
            EsActivityAccountVO esActivityAccountVO = new EsActivityAccountVO();
            BeanUtils.copyProperties(esActivityAccount, esActivityAccountVO);
            list.add(esActivityAccountVO);
        }
        return list;
    }

    @Override
    public List<EsUserAwardRecordVO> queryEsUserAwardRecordVOList() {
        List<EsUserAwardRecord> esUserAwardRecords = esUserAwardRecordMapper.queryUserAwardRecordVOListEs();
        ArrayList<EsUserAwardRecordVO> list = new ArrayList<>();
        for (EsUserAwardRecord esUserAwardRecord : esUserAwardRecords) {
            EsUserAwardRecordVO esUserAwardRecordVO = new EsUserAwardRecordVO();
            BeanUtils.copyProperties(esUserAwardRecord, esUserAwardRecordVO);
            list.add(esUserAwardRecordVO);
        }
        return list;
    }

    @Override
    public List<EsUserAwardRecordVO> queryEsUserAwardRecordVOList(Long activityId) {
        List<EsUserAwardRecord> esUserAwardRecords = esUserAwardRecordMapper.queryUserAwardRecordVOListEsByActivityId();
        ArrayList<EsUserAwardRecordVO> list = new ArrayList<>();
        for (EsUserAwardRecord esUserAwardRecord : esUserAwardRecords) {
            EsUserAwardRecordVO esUserAwardRecordVO = new EsUserAwardRecordVO();
            BeanUtils.copyProperties(esUserAwardRecord, esUserAwardRecordVO);
            list.add(esUserAwardRecordVO);
        }
        return list;
    }

    @Override
    public List<EsUserAwardRecordSimpleVO> queryUserAwardRecordSimpleEsByActivityId(Long activityId) {
        List<EsUserAwardRecordSimple> esUserAwardRecordSimples = esUserAwardRecordMapper.queryUserAwardRecordSimpleEsByActivityId(activityId);
        ArrayList<EsUserAwardRecordSimpleVO> list = new ArrayList<>();
        for (EsUserAwardRecordSimple esUserAwardRecordSimple : esUserAwardRecordSimples) {
            EsUserAwardRecordSimpleVO esUserAwardRecordSimpleVO = new EsUserAwardRecordSimpleVO();
            BeanUtils.copyProperties(esUserAwardRecordSimple, esUserAwardRecordSimpleVO);
            list.add(esUserAwardRecordSimpleVO);
        }
        return list;
    }

    @Override
    public List<EsCreditAccountVO> queryCreditAccountVOList() {
        List<EsCreditAccount> esCreditAccounts = esCreditAccountMapper.queryCreditAccount();
        ArrayList<EsCreditAccountVO> list = new ArrayList<>();
        for (EsCreditAccount esCreditAccount : esCreditAccounts) {
            EsCreditAccountVO esCreditAccountVO = new EsCreditAccountVO();
            BeanUtils.copyProperties(esCreditAccount, esCreditAccountVO);
            list.add(esCreditAccountVO);
        }
        return list;
    }

    @Override
    public List<EsCreditRecordVO> queryCreditRecordVOList() {
        List<EsCreditRecord> esCreditRecords = esCreditRecordMapper.queryCreditRecordVOListEs();
        ArrayList<EsCreditRecordVO> list = new ArrayList<>();
        for (EsCreditRecord esCreditRecord : esCreditRecords) {
            EsCreditRecordVO esCreditRecordVO = new EsCreditRecordVO();
            BeanUtils.copyProperties(esCreditRecord, esCreditRecordVO);
            list.add(esCreditRecordVO);
        }
        return list;
    }

    @Override
    public List<EsActivityRecordVO> queryEsActivityRecordVOList() {
        List<EsActivityRecord> esActivityRecords = esActivityRecordMapper.queryActivityRecordVOListEs();
        ArrayList<EsActivityRecordVO> list = new ArrayList<>();
        for (EsActivityRecord esActivityRecord : esActivityRecords) {
            EsActivityRecordVO esActivityRecordVO = new EsActivityRecordVO();
            BeanUtils.copyProperties(esActivityRecord, esActivityRecordVO);
            list.add(esActivityRecordVO);
        }
        return list;
    }

    @Override
    public List<EsUserBehaviorRebateOrderVO> queryEsUserBehaviorRebateOrderVOList() {
        List<EsUserBehaviorRebateOrder> esUserBehaviorRebateOrders = esUserBehaviorRebateOrderMapper.queryUserBehaviorRebateOrderVOListEs();
        ArrayList<EsUserBehaviorRebateOrderVO> list = new ArrayList<>();
        for (EsUserBehaviorRebateOrder esUserBehaviorRebateOrder : esUserBehaviorRebateOrders) {
            EsUserBehaviorRebateOrderVO esUserBehaviorRebateOrderVO = new EsUserBehaviorRebateOrderVO();
            BeanUtils.copyProperties(esUserBehaviorRebateOrder, esUserBehaviorRebateOrderVO);
            list.add(esUserBehaviorRebateOrderVO);
        }
        return list;
    }

}
