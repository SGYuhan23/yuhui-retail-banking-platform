package com.yuhui.trigger.api;

import com.yuhui.trigger.api.dto.req.*;
import com.yuhui.trigger.api.dto.res.ActivityDrawResponseDTO;
import com.yuhui.trigger.api.dto.res.SkuProductResponseDTO;
import com.yuhui.trigger.api.dto.res.UserActivityAccountResponseDTO;
import com.yuhui.trigger.api.dto.res.UserAwardRecordResponseDTO;
import com.yuhui.types.model.BaseResponse;
import com.yuhui.types.model.MyPage;

import java.math.BigDecimal;
import java.util.List;

/**

 * 抽奖活动相关服务接口
 */
public interface LotteryActivityService {
    /**
     * 活动装配，数据预热缓存
     *
     * @param activityId 活动ID
     * @return 装配结果
     */
    BaseResponse<Boolean> armory(Long activityId);

    /**
     * 活动抽奖接口
     *
     * @param request 请求对象
     * @return 返回结果
     */
    BaseResponse<ActivityDrawResponseDTO> draw(ActivityDrawRequestDTO request);

    /**
     * 日历签到返利接口
     *
     * @param calendarSignRebateRequestDTO 参数
     * @return 签到结果
     */
    BaseResponse<Boolean> calendarSignRebate(CalendarSignRebateRequestDTO calendarSignRebateRequestDTO);

    /**
     * 查询账户额度接口
     *
     * @param requestDTO 请求参数
     * @return UserActivityAccountResponseDTO
     */
    BaseResponse<UserActivityAccountResponseDTO> queryUserActivityAccount(UserActivityAccountRequestDTO requestDTO);

    /**
     * 查询今日是否已签到
     *
     * @param calendarSignRebateRequestDTO 入参
     * @return Boolean
     */
    BaseResponse<Boolean> isCalendarSignRebate(CalendarSignRebateRequestDTO calendarSignRebateRequestDTO);

    /**
     * 查询sku商品集合
     *
     * @param activityId 活动ID
     * @return 商品集合
     */
    BaseResponse<List<SkuProductResponseDTO>> querySkuProductListByActivityId(Long activityId);

    /**
     * 查询用户积分值
     *
     * @param requestDTO 入参
     * @return 可用积分
     */
    BaseResponse<BigDecimal> queryUserCreditAccount(UserCreditAccountRequestDTO requestDTO);

    /**
     * 积分支付兑换商品
     *
     * @param request 请求对象「用户ID、sku商品ID」
     * @return Boolean
     */
    BaseResponse<Boolean> creditPayExchangeSku(SkuProductShopCartRequestDTO request);

    /**
     * 查询用户抽奖播报
     *
     * @param activityId 活动ID
     * @return 用户抽奖播报
     */
//    BaseResponse<List<EsUserAwardRecordResponseDTO>> queryUserAwardRecordByActivityId(Long activityId);


    /**
     * 查询用户个人获奖记录
     *
     * @param pageNum    页码
     * @param pageSize   每页大小
     * @param activityId 活动ID
     * @param userId     用户ID
     * @return 用户个人获奖记录
     */
    BaseResponse<MyPage<UserAwardRecordResponseDTO>> queryMyAwardRecordByPage(Integer pageNum, Integer pageSize, Long activityId, String userId);

    /**
     * 添加抽奖额度
     *
     * @param requestDTO 添加抽奖额度入参
     * @return 添加结果
     */
    BaseResponse<Boolean> addLotteryQuota(AddLotteryQuotaRequestDTO requestDTO);

    /**
     * 是否已领取抽奖额度
     *
     * @param requestDTO
     * @return
     */
    BaseResponse<Boolean> isAddLotteryQuota(AddLotteryQuotaRequestDTO requestDTO);
}
