package com.yuhui.trigger.http;


import com.yuhui.querys.adapter.repository.EsErpRepository;
import com.yuhui.querys.model.valobj.*;
import com.yuhui.trigger.api.ErpOperateService;
import com.yuhui.trigger.api.dto.res.*;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.model.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/erp")
public class ErpOperateController implements ErpOperateService {
    @Resource
    private EsErpRepository repository;

    @Override
    @GetMapping("/query_user_order")
    public BaseResponse<List<EsUserOrderResponseDTO>> queryUserOrder() {
        log.info("======================[ErpOperateController-queryUserOrder]运营端 查询用户抽奖单开始 ======================");
        List<EsUserOrderVO> esUserOrders = repository.queryEsUserOrderVOList();
        List<EsUserOrderResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esUserOrders, EsUserOrderResponseDTO::new);
        log.info("======================[ErpOperateController-queryUserOrder]运营端 查询用户抽奖单成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_activity_account")
    public BaseResponse<List<EsActivityAccountResponseDTO>> queryActivityAccount() {
        log.info("======================[ErpOperateController-queryActivityAccount]运营端 查询抽奖账户开始 ======================");
        List<EsActivityAccountVO> esActivityAccounts = repository.queryEsActivityAccountVOList();
        List<EsActivityAccountResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esActivityAccounts, EsActivityAccountResponseDTO::new);
        log.info("======================[ErpOperateController-queryActivityAccount]运营端 查询抽奖账户成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_user_award_record")
    public BaseResponse<List<EsUserAwardRecordResponseDTO>> queryUserAwardRecord() {
        log.info("======================[ErpOperateController-queryUserAwardRecord]运营端 查询中奖记录开始 ======================");
        List<EsUserAwardRecordVO> esUserAwardRecords = repository.queryEsUserAwardRecordVOList();
        List<EsUserAwardRecordResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esUserAwardRecords, EsUserAwardRecordResponseDTO::new);
        log.info("======================[ErpOperateController-queryUserAwardRecord]运营端 查询中奖记录成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_user_award_record_by_activity_id")
    public BaseResponse<List<EsUserAwardRecordSimpleResponseDTO>> queryUserAwardRecordByActivityId(Long activityId) {
        log.info("======================[ErpOperateController-queryUserAwardRecordByActivityId]运营端 根据活动ID查询中奖记录开始 ======================");
        List<EsUserAwardRecordSimpleVO> esUserAwardRecordSimples = repository.queryUserAwardRecordSimpleEsByActivityId(activityId);
        List<EsUserAwardRecordSimpleResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esUserAwardRecordSimples, EsUserAwardRecordSimpleResponseDTO::new);
        log.info("======================[ErpOperateController-queryUserAwardRecordByActivityId]运营端 根据活动ID查询中奖记录成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_credit_account")
    public BaseResponse<List<EsCreditAccountResponseDTO>> queryCreditAccount() {
        log.info("======================[ErpOperateController-queryCreditAccount]运营端 查询积分账户开始 ======================");
        List<EsCreditAccountVO> esCreditAccounts = repository.queryCreditAccountVOList();
        List<EsCreditAccountResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esCreditAccounts, EsCreditAccountResponseDTO::new);
        log.info("======================[ErpOperateController-queryCreditAccount]运营端 查询积分账户成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_credit_record")
    public BaseResponse<List<EsCreditRecordResponseDTO>> queryCreditRecord() {
        log.info("======================[ErpOperateController-queryCreditRecord]运营端 查询积分记录开始 ======================");
        List<EsCreditRecordVO> esCreditRecords = repository.queryCreditRecordVOList();
        List<EsCreditRecordResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esCreditRecords, EsCreditRecordResponseDTO::new);
        log.info("======================[ErpOperateController-queryCreditRecord]运营端 查询积分记录成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_activity_record")
    public BaseResponse<List<EsActivityRecordResponseDTO>> queryActivityRecord() {
        log.info("======================[ErpOperateController-queryActivityRecord]运营端 查询抽奖账户记录开始 ======================");
        List<EsActivityRecordVO> esActivityRecords = repository.queryEsActivityRecordVOList();
        List<EsActivityRecordResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esActivityRecords, EsActivityRecordResponseDTO::new);
        log.info("======================[ErpOperateController-queryActivityRecord]运营端 查询抽奖账户记录成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }

    @Override
    @GetMapping("/query_user_behavior_rebate_order")
    public BaseResponse<List<EsUserBehaviorRebateOrderResponseDTO>> queryUserBehaviorRebateOrder() {
        log.info("======================[ErpOperateController-queryUserBehaviorRebateOrder]运营端 查询用户行为返利订单开始 ======================");
        List<EsUserBehaviorRebateOrderVO> esUserBehaviorRebateOrders = repository.queryEsUserBehaviorRebateOrderVOList();
        List<EsUserBehaviorRebateOrderResponseDTO> list = com.yuhui.types.model.BeanProjection.list(esUserBehaviorRebateOrders, EsUserBehaviorRebateOrderResponseDTO::new);
        log.info("======================[ErpOperateController-queryUserBehaviorRebateOrder]运营端 查询用户行为返利订单成功 ======================");
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), list);
    }
}
