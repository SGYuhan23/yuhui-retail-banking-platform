package com.yuhui.trigger.http;

import com.yuhui.marketing.participation.model.entity.*;
import com.yuhui.marketing.participation.service.ActivityQuotaService;
import com.yuhui.marketing.participation.service.ActivitySkuProductService;
import com.yuhui.marketing.participation.service.armory.ActivityArmory;
import com.yuhui.marketing.points.model.entity.CreditAccountEntity;
import com.yuhui.marketing.points.service.CreditService;
import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
import com.yuhui.marketing.reward.behavior.model.valobj.BehaviorTypeVO;
import com.yuhui.marketing.reward.behavior.service.RebateService;
import com.yuhui.marketing.raffle.model.entity.LotteryResEntity;
import com.yuhui.marketing.raffle.service.Rule;
import com.yuhui.marketing.raffle.service.armory.StrategyArmory;
import com.yuhui.querys.adapter.repository.ErpRepository;
import com.yuhui.querys.model.valobj.UserAwardRecordVO;
import com.yuhui.trigger.api.LotteryActivityService;
import com.yuhui.trigger.api.dto.req.*;
import com.yuhui.trigger.api.dto.res.*;
import com.yuhui.types.annotation.DCCValue;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixSync;
import com.yuhui.types.annotation.PermissionCheck;
import com.yuhui.types.annotation.RateLimiterAccessInterceptor;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import com.yuhui.types.model.BaseResponse;
import com.yuhui.types.model.MyPage;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/activity")
public class LotteryActivityController implements LotteryActivityService {
    @Resource private com.yuhui.application.PointsQuotaExchange pointsQuotaExchange;
    @Resource private com.yuhui.marketing.application.DrawParticipation drawParticipation;

    @Resource
    private StrategyArmory strategyArmory;
    @Resource
    private ActivityArmory activityArmory;
    @Resource
    private RebateService rebateService;
    @Resource
    private ActivityQuotaService activityQuotaService;
    @Resource
    private ActivitySkuProductService activitySkuProductService;
    @Resource
    private CreditService creditService;
    @DCCValue("degradeSwitch:close")
    private String degradeSwitch;
    @Resource
    private ErpRepository repository;
    @Resource
    private Rule rule;

    @Override
    @PostMapping("/armory")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    @DeleteOldCacheWithPrefixSync(key = {Constants.RedisKey.ACTIVITY_SKU_LIST_KEY,Constants.RedisKey.ACTIVITY_AWARD_LIST_KEY})
    public BaseResponse<Boolean> armory(@RequestParam Long activityId) {
        log.info("======================[LotteryActivityController-armory]预热开始 activityId:{} ======================", activityId);
        // 1. 活动装配 suk库存、对应次数列表、该活动信息
        activityArmory.assembleActivitySkuByActivityId(activityId);
        log.info("[LotteryActivityController-armory]预热活动信息 activityId:{}", activityId);
        // 2. 策略装配 该活动奖品列表、每个奖品数量、奖品信息、概率范围值、概率表、概率+权重表、规则树
        strategyArmory.assembleLotteryStrategyByActivityId(activityId);
        log.info("[LotteryActivityController-armory]预热策略信息 activityId:{}", activityId);
        // 3. 预热权重奖品strategy_rule_weight_200001
        rule.queryStrategyRuleWeight(activityId);
        log.info("[LotteryActivityController-armory]预热权重奖品信息 activityId:{}", activityId);
        log.info("======================[LotteryActivityController-armory]预热成功 activityId:{} ======================", activityId);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/draw")
    //每秒超过2次，频次限制 累计这种情况3次，黑名单拦截 24小时后解封
    @RateLimiterAccessInterceptor(key = "userId", fallbackMethod = "drawRateLimiterError", permitsPerSecond = 2, blacklistCount = 3)
    //超过1500ms无响应或出现异常，走drawHystrixError方法
    public BaseResponse<ActivityDrawResponseDTO> draw(@RequestBody ActivityDrawRequestDTO request) {
        log.info("======================[LotteryActivityController-draw]用户抽奖开始 userId:{} activityId:{} ======================", request.getUserId(), request.getActivityId());
        if ("open".equals(degradeSwitch)) {
            log.info("======================[LotteryActivityController-draw]用户抽奖结束,已进行降级处理 ======================");
            return new BaseResponse<>(ResponseCode.DEGRADE_SWITCH.getCode(), ResponseCode.DEGRADE_SWITCH.getMessage());
        }
        // 1. 参数校验
        if (StringUtils.isBlank(request.getUserId()) || request.getActivityId() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        LotteryResEntity lotteryResEntity=drawParticipation.draw(request.getUserId(),request.getActivityId());
        // 5. 返回结果
        ActivityDrawResponseDTO result = ActivityDrawResponseDTO.builder()
                .awardId(lotteryResEntity.getAwardId())
                .awardTitle(lotteryResEntity.getAwardTitle())
                .awardIndex(lotteryResEntity.getSort())
                .build();
        log.info("======================[LotteryActivityController-draw]用户抽奖结束 userId:{} activityId:{} award:{} ======================", request.getUserId(), request.getActivityId(), result);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), result);
    }

    public BaseResponse<ActivityDrawResponseDTO> drawRateLimiterError(ActivityDrawRequestDTO request) {
        log.error("!!!!!!!!!![LotteryActivityController-drawRateLimiterError]用户抽奖限流 userId:{} activityId:{} !!!!!!!!!!", request.getUserId(), request.getActivityId());
        return new BaseResponse<>(ResponseCode.RATE_LIMITER.getCode(), ResponseCode.RATE_LIMITER.getMessage());
    }

    public BaseResponse<ActivityDrawResponseDTO> drawHystrixError(ActivityDrawRequestDTO request, Throwable throwable) {
        String message = throwable.getMessage();
        if (message == null) {
            message = "响应超时,请稍后再试";
        }
        log.error("!!!!!!!!!![LotteryActivityController-drawHystrixError]用户抽奖熔断: {} userId:{} activityId:{} !!!!!!!!!!", message, request.getUserId(), request.getActivityId());
        return new BaseResponse<>(ResponseCode.HYSTRIX.getCode(), message);
    }

    @Override
    @PostMapping("/calendar_sign_rebate")
    public BaseResponse<Boolean> calendarSignRebate(@RequestBody CalendarSignRebateRequestDTO calendarSignRebateRequestDTO) {
        String userId = calendarSignRebateRequestDTO.getUserId();
        Long activityId = calendarSignRebateRequestDTO.getActivityId();
        log.info("======================[LotteryActivityController-calendarSignRebate]用户签到返现开始 userId:{} activityId:{} ======================", userId, activityId);
        BehaviorEntity behaviorEntity = new BehaviorEntity();
        behaviorEntity.setUserId(userId);
        behaviorEntity.setActivityId(activityId);
        behaviorEntity.setBehaviorTypeVO(BehaviorTypeVO.SIGN);
        behaviorEntity.setOutBusinessNo(new SimpleDateFormat("yyyyMMdd").format(new Date()));
        List<String> orderIds = rebateService.createRebateOrder(behaviorEntity);
        log.info("======================[LotteryActivityController-calendarSignRebate]用户签到返现成功 userId:{} rebateOrderIds:{} ======================", userId, orderIds);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/query_user_activity_account")
    public BaseResponse<UserActivityAccountResponseDTO> queryUserActivityAccount(@RequestBody UserActivityAccountRequestDTO requestDTO) {
        log.info("======================[LotteryActivityController-queryUserActivityAccount]查询用户抽奖次数信息开始 userId:{} activityId:{} ======================", requestDTO.getUserId(), requestDTO.getActivityId());
        // 1.参数校验
        if (StringUtils.isBlank(requestDTO.getUserId()) || requestDTO.getActivityId() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        // 2.查询
        ActivityAccountEntity activityAccountEntity = activityQuotaService.queryUserActivityAccount(requestDTO.getUserId(), requestDTO.getActivityId());
        // 3.返回结果
        UserActivityAccountResponseDTO res = new UserActivityAccountResponseDTO();
        BeanUtils.copyProperties(activityAccountEntity, res);
        log.info("======================[LotteryActivityController-queryUserActivityAccount]查询用户抽奖次数信息成功 userId:{} activityId:{} ======================", requestDTO.getUserId(), requestDTO.getActivityId());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), res);
    }

    @Override
    @PostMapping("/is_calendar_sign_rebate")
    public BaseResponse<Boolean> isCalendarSignRebate(@RequestBody CalendarSignRebateRequestDTO calendarSignRebateRequestDTO) {
        String userId = calendarSignRebateRequestDTO.getUserId();
        Long activityId = calendarSignRebateRequestDTO.getActivityId();
        log.info("======================[LotteryActivityController-isCalendarSignRebate]查询用户当日是否已签到开始 userId:{} activityId:{}======================", userId, activityId);
        String outBusinessNo = new SimpleDateFormat("yyyyMMdd").format(new Date());
        boolean b = rebateService.queryIsHaveRebateOrder(userId, activityId, outBusinessNo);
        log.info("======================[LotteryActivityController-isCalendarSignRebate]查询用户当日是否已签到成功 userId:{} activityId:{} 当日是否已签到:{} ======================", userId, activityId, b);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), b);
    }

    @Override
    @GetMapping("/query_sku_product_list_by_activity_id")
    public BaseResponse<List<SkuProductResponseDTO>> querySkuProductListByActivityId(@RequestParam Long activityId) {
        log.info("======================[LotteryActivityController-querySkuProductListByActivityId]查询积分兑换商品sku列表开始 activityId:{} ======================", activityId);
        if (activityId == null) {
            return new BaseResponse<>(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        List<SkuProductEntity> skuProductEntities = activitySkuProductService.querySkuProductEntityListByActivityId(activityId);
        ArrayList<SkuProductResponseDTO> skuProductResponseDTOS = new ArrayList<>();
        for (SkuProductEntity skuProductEntity : skuProductEntities) {
            SkuProductResponseDTO.ActivityCount activityCount = new SkuProductResponseDTO.ActivityCount();
            BeanUtils.copyProperties(skuProductEntity.getActivityCount(), activityCount);
            SkuProductResponseDTO skuProductResponseDTO = new SkuProductResponseDTO();
            BeanUtils.copyProperties(skuProductEntity, skuProductResponseDTO);
            skuProductResponseDTO.setActivityCount(activityCount);
            skuProductResponseDTOS.add(skuProductResponseDTO);
        }
        log.info("======================[LotteryActivityController-querySkuProductListByActivityId]查询积分兑换sku商品列表成功 activityId:{} ======================", activityId);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), skuProductResponseDTOS);
    }

    @Override
    @PostMapping("/query_user_credit_account")
    public BaseResponse<BigDecimal> queryUserCreditAccount(@RequestBody UserCreditAccountRequestDTO requestDTO) {
        String userId = requestDTO.getUserId();
        Long activityId = requestDTO.getActivityId();
        log.info("======================[LotteryActivityController-queryUserCreditAccount]查询用户积分开始 userId:{} activityId:{} ======================", userId, activityId);
        // 1.参数校验
        if (StringUtils.isBlank(userId) || activityId == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getMessage());
        }
        CreditAccountEntity creditAccountEntity = creditService.queryUserCreditAccount(userId, activityId);
        log.info("======================[LotteryActivityController-queryUserCreditAccount]查询用户积分成功 userId:{} activityId:{} creditAmount:{} ======================", userId, activityId, creditAccountEntity.getCreditAmount());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), creditAccountEntity.getCreditAmount());
    }

    @Override
    @PostMapping("/credit_pay_exchange_sku")
    public BaseResponse<Boolean> creditPayExchangeSku(@RequestBody SkuProductShopCartRequestDTO request) {
        if (StringUtils.isBlank(request.getUserId()) || request.getActivityId() == null || request.getSku() == null) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), "兑换参数不完整");
        }
        pointsQuotaExchange.exchange(request.getUserId(),request.getActivityId(),request.getSku());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(),ResponseCode.SUCCESS.getMessage(),true);
    }


    @GetMapping("/query_my_award_record")
    @Override
    public BaseResponse<MyPage<UserAwardRecordResponseDTO>> queryMyAwardRecordByPage(@RequestParam(defaultValue = "1") Integer pageNum,
                                                                                     @RequestParam(defaultValue = "36") Integer pageSize,
                                                                                     @RequestParam Long activityId,
                                                                                     @RequestParam String userId) {
        log.info("======================[LotteryActivityController-queryUserAwardRecordByActivityId]查询个人中奖记录开始 activityId:{} userId:{}======================", activityId, userId);
        MyPage<UserAwardRecordVO> userAwardRecords = repository.queryUserAwardRecordVOListByPage(pageNum, pageSize, activityId, userId);
        ArrayList<UserAwardRecordResponseDTO> list = new ArrayList<>();
        if (userAwardRecords.getItems() == null) {
            log.info("======================[LotteryActivityController-queryUserAwardRecordByActivityId]查询个人中奖记录成功 activityId:{} userId:{}======================", activityId, userId);
            return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), new MyPage<>());
        }
        for (UserAwardRecordVO userAwardRecord : userAwardRecords.getItems()) {
            UserAwardRecordResponseDTO userAwardRecordResponseDTO = new UserAwardRecordResponseDTO();
            BeanUtils.copyProperties(userAwardRecord, userAwardRecordResponseDTO);
            list.add(userAwardRecordResponseDTO);
        }
        MyPage<UserAwardRecordResponseDTO> myPage = new MyPage<>();
        myPage.setItems(list);
        myPage.setTotal(userAwardRecords.getTotal());
        log.info("======================[LotteryActivityController-queryUserAwardRecordByActivityId]查询个人中奖记录成功 activityId:{} userId:{}======================", activityId, userId);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), myPage);
    }

    @Override
    @PostMapping("/add_lottery_quota")
    public BaseResponse<Boolean> addLotteryQuota(@RequestBody AddLotteryQuotaRequestDTO request) {
        log.info("======================[LotteryActivityController-addLotteryQuota]赠送抽奖额度开始 userId:{} activityId:{} behaviorRebateId:{} ======================", request.getUserId(), request.getActivityId(),request.getBehaviorRebateId());
        String userId = request.getUserId();
        Long activityId = request.getActivityId();
        Long behaviorRebateId = request.getBehaviorRebateId();
        BehaviorEntity behaviorEntity = new BehaviorEntity();
        behaviorEntity.setUserId(userId);
        behaviorEntity.setActivityId(activityId);
        behaviorEntity.setBehaviorRebateId(behaviorRebateId);
        behaviorEntity.setBehaviorTypeVO(BehaviorTypeVO.ACTIVITY_GIFT);
        behaviorEntity.setOutBusinessNo(new SimpleDateFormat("yyyy").format(new Date()));
        rebateService.createRebateOrderOfGift(behaviorEntity);
        log.info("======================[LotteryActivityController-addLotteryQuota]赠送抽奖额度成功 userId:{} activityId:{} rebateOrderId:{} ======================", userId,activityId,behaviorRebateId);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), true);
    }

    @Override
    @PostMapping("/is_add_lottery_quota")
    public BaseResponse<Boolean> isAddLotteryQuota(@RequestBody AddLotteryQuotaRequestDTO request) {
        String userId = request.getUserId();
        Long activityId = request.getActivityId();
        Long behaviorRebateId = request.getBehaviorRebateId();
        log.info("======================[LotteryActivityController-isAddLotteryQuota]查询用户是否已领取抽奖额度开始 userId:{} activityId:{} behaviorRebateId:{} ======================", userId, activityId,behaviorRebateId);
        boolean b = rebateService.isAddLotteryQuota(userId, activityId,behaviorRebateId);
        log.info("======================[LotteryActivityController-isAddLotteryQuota]查询用户是否已领取抽奖额度成功 userId:{} activityId{} behaviorRebateId:{} 是否领取:{} ======================", userId, activityId,behaviorRebateId, b);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), b);
    }

}
