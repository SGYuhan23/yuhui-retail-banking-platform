package com.yuhui.trigger.api;

import com.yuhui.trigger.api.dto.req.LotteryAwardListRequestDTO;
import com.yuhui.trigger.api.dto.req.StrategyRuleWeightRequestDTO;
import com.yuhui.trigger.api.dto.res.LotteryAwardListResponseDTO;
import com.yuhui.trigger.api.dto.res.StrategyRuleWeightResponseDTO;
import com.yuhui.types.model.BaseResponse;

import java.util.List;

/**

 * 抽奖相关服务接口
 */
public interface LotteryStrategyService {

//    /**
//     * 策略装配接口
//     *
//     * @param strategyId 策略ID
//     * @return 装配结果
//     */
//    BaseResponse<Boolean> strategyArmory(Long strategyId);

    /**
     * 查询抽奖奖品列表接口
     *
     * @param requestDTO 请求参数
     * @return 奖品列表数据
     */
    BaseResponse<List<LotteryAwardListResponseDTO>> queryLotteryAwardList(LotteryAwardListRequestDTO requestDTO);


//    /**
//     * 随机抽奖接口
//     *
//     * @param requestDTO 请求参数
//     * @return 抽奖结果
//     */
//    BaseResponse<LotteryResponseDTO> randomLottery(LotteryRequestDTO requestDTO);

    /**
     * 查询活动策略权重(进度条所需信息)
     *
     * @param requestDTO 请求参数
     * @return StrategyRuleWeightResponseDTO
     */
    BaseResponse<List<StrategyRuleWeightResponseDTO>> queryStrategyRuleWeight(StrategyRuleWeightRequestDTO requestDTO);
}
