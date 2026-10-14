package com.yuhui.infrastructure.adapter.repository;

import cn.bugstack.middleware.db.router.strategy.IDBRouterStrategy;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.CountPrizesAggregate;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.GiveOutPrizesAggregate;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.UserAwardRecordAggregate;
import com.yuhui.marketing.reward.fulfillment.model.entity.TaskEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserCountAwardEntity;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserCreditAwardEntity;
import com.yuhui.marketing.reward.fulfillment.model.valobj.AccountStatusVO;
import com.yuhui.marketing.reward.fulfillment.repository.UserAwardRepository;
import com.yuhui.marketing.points.model.valobj.TradeNameVO;
import com.yuhui.marketing.points.model.valobj.TradeTypeVO;
import com.yuhui.infrastructure.dao.*;
import com.yuhui.infrastructure.dao.po.*;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;

import javax.annotation.Resource;
import java.math.BigDecimal;

/**

 * 奖品服务仓储实现
 */
@Repository
@Slf4j
public class RewardSettlementStore implements com.yuhui.marketing.reward.fulfillment.repository.RewardSettlement {
    @Resource
    private UserAwardRecordMapper userAwardRecordMapper;
    @Resource
    private CreditAccountMapper creditAccountMapper;
    @Resource
    private AwardMapper awardMapper;
    @Resource
    private IDBRouterStrategy dbRouter;
    @Resource
    private TransactionTemplate transactionTemplate;
    @Resource
    private RedisService redisService;
    @Resource
    private CreditRecordMapper creditRecordMapper;
    @Autowired
    private ActivityAccountDayMapper activityAccountDayMapper;
    @Resource
    private ActivityAccountMonthMapper activityAccountMonthMapper;
    @Resource
    private ActivityAccountMapper activityAccountMapper;
    @Resource
    private ActivityRecordMapper activityRecordMapper;
    @Override
    public void saveGiveOutPrizes(GiveOutPrizesAggregate giveOutPrizesAggregate) {
        String userId = giveOutPrizesAggregate.getUserId();
        UserAwardRecordEntity userAwardRecordEntity = giveOutPrizesAggregate.getUserAwardRecordEntity();
        UserCreditAwardEntity userCreditAwardEntity = giveOutPrizesAggregate.getUserCreditAwardEntity();
        // 更新发奖状态
        UserAwardRecord userAwardRecord = new UserAwardRecord();
        userAwardRecord.setAwardState(userAwardRecordEntity.getAwardState().getCode());
        // 更新用户积分
        CreditAccount creditAccount = new CreditAccount();
        creditAccount.setUserId(userId);
        creditAccount.setActivityId(userAwardRecordEntity.getActivityId());
        creditAccount.setTotalAmount(userCreditAwardEntity.getCreditAmount());
        creditAccount.setAvailableAmount(userCreditAwardEntity.getCreditAmount());
        creditAccount.setAccountStatus(AccountStatusVO.open.getCode());
        // 写入积分记录
        CreditRecord creditRecord = new CreditRecord();
        creditRecord.setUserId(userId);
        creditRecord.setActivityId(userAwardRecordEntity.getActivityId());
        creditRecord.setTradeName(TradeNameVO.LOTTERY_AWARD.getName());
        creditRecord.setTradeType(TradeTypeVO.FORWARD.getCode());
        creditRecord.setTradeAmount(userCreditAwardEntity.getCreditAmount());
        // Stable business key survives retries and permits multiple wins within one second.
        creditRecord.setOutBusinessNo("lottery-award:" + userAwardRecordEntity.getUserOrderId());
        RLock lock = redisService.getLock(Constants.RedisKey.CREDIT_ACCOUNT_LOCK + userId + Constants.UNDERLINE + userAwardRecordEntity.getActivityId());
        try {
            lock.lock();
            dbRouter.doRouter(userId);
            transactionTemplate.execute(status -> {
                try {
                    UserAwardRecord existing = userAwardRecordMapper.selectOne(new LambdaQueryWrapper<UserAwardRecord>()
                            .eq(UserAwardRecord::getUserId, userId)
                            .eq(UserAwardRecord::getUserOrderId, userAwardRecordEntity.getUserOrderId())
                            .eq(UserAwardRecord::getActivityId, userAwardRecordEntity.getActivityId())
                            .eq(UserAwardRecord::getAwardId, userAwardRecordEntity.getAwardId())
                            .last("FOR UPDATE"));
                    if (existing == null) throw new IllegalStateException("Award record missing");
                    if ("complete".equals(existing.getAwardState())) return 1;
                    // 写入积分记录表
                    creditRecordMapper.insert(creditRecord);
                    log.debug("[UserAwardRepositoryImpl]写入积分记录成功 userId:{}", userId);
                    // 更新/创建积分账户
                    LambdaQueryWrapper<CreditAccount> queryWrapper = new QueryWrapper<CreditAccount>().lambda().eq(CreditAccount::getUserId, userId).eq(CreditAccount::getActivityId, userAwardRecordEntity.getActivityId());
                    CreditAccount dbCreditAccount = creditAccountMapper.selectOne(queryWrapper);
                    if (dbCreditAccount == null) {
                        // 新增
                        creditAccountMapper.insert(creditAccount);
                        log.debug("[UserAwardRepositoryImpl]创建积分账户成功 userId:{}", userId);
                    } else {
                        // 更新
                        creditAccountMapper.update(creditAccount);
                        log.debug("[UserAwardRepositoryImpl]更新积分账户成功 userId:{}", userId);
                    }
                    // 更新中奖记录状态为completed 发奖完成
                    int count = userAwardRecordMapper.update(userAwardRecord, new LambdaUpdateWrapper<UserAwardRecord>().eq(UserAwardRecord::getUserOrderId, userAwardRecordEntity.getUserOrderId()));
                    log.debug("[UserAwardRepositoryImpl]更新中奖记录状态为 completed 发奖完成成功 userId:{} giveOutPrizesAggregate:{}", userId, JSON.toJSONString(giveOutPrizesAggregate));
                    if (count == 0) {
                        log.error("[UserAwardRepositoryImpl]更新中奖记录状态为 completed 发奖完成失败 userId:{} giveOutPrizesAggregate:{}", userId, JSON.toJSONString(giveOutPrizesAggregate));
                        throw new IllegalStateException("Award settlement update failed");
                    }
                    return 1;
                } catch (DuplicateKeyException e) {
                    status.setRollbackOnly();
                    log.error("[UserAwardRepositoryImpl]更新中奖记录，唯一索引冲突 userId: {} ", userId, e);
                    throw new AppException(ResponseCode.INDEX_DUP.getCode(), e);
                }
            });
        } finally {
            dbRouter.clear();
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }

    }

    @Override
    public void saveCountPrizes(CountPrizesAggregate countPrizesAggregate) {
        String userId = countPrizesAggregate.getUserId();
        UserAwardRecordEntity userAwardRecordEntity = countPrizesAggregate.getUserAwardRecordEntity();
        UserCountAwardEntity userCountAwardEntity = countPrizesAggregate.getUserCountAwardEntity();

        UserAwardRecord userAwardRecord = new UserAwardRecord();
        userAwardRecord.setAwardState(userAwardRecordEntity.getAwardState().getCode());

        // 添加抽奖次数流水
        ActivityRecord activityRecord = new ActivityRecord();
        activityRecord.setUserId(userId);
        activityRecord.setActivityId(userCountAwardEntity.getActivityId());
        activityRecord.setTotalCount(userCountAwardEntity.getCount());
        activityRecord.setDayCount(userCountAwardEntity.getCount());
        activityRecord.setMonthCount(userCountAwardEntity.getCount());
        activityRecord.setPayAmount(BigDecimal.ZERO);
        activityRecord.setState(userAwardRecordEntity.getAwardState().getCode());
        activityRecord.setOutBusinessNo("lottery-count:" + userAwardRecordEntity.getUserOrderId());

        RLock lock = redisService.getLock(Constants.RedisKey.ACTIVITY_ACCOUNT_LOCK + userId + Constants.UNDERLINE + userAwardRecordEntity.getActivityId());
        try {
            lock.lock();
            dbRouter.doRouter(userId);
            transactionTemplate.execute(status -> {
                try {
                    UserAwardRecord existing = userAwardRecordMapper.selectOne(new LambdaQueryWrapper<UserAwardRecord>()
                            .eq(UserAwardRecord::getUserId, userId)
                            .eq(UserAwardRecord::getUserOrderId, userAwardRecordEntity.getUserOrderId())
                            .eq(UserAwardRecord::getActivityId, userAwardRecordEntity.getActivityId())
                            .eq(UserAwardRecord::getAwardId, userAwardRecordEntity.getAwardId())
                            .last("FOR UPDATE"));
                    if (existing == null) throw new IllegalStateException("Award record missing");
                    if ("complete".equals(existing.getAwardState())) return 1;
                    int delta = userCountAwardEntity.getCount();
                    if (delta <= 0) throw new IllegalArgumentException("Award count must be positive");
                    ActivityAccount account = new ActivityAccount();
                    account.setUserId(userId); account.setActivityId(userCountAwardEntity.getActivityId());
                    account.setTotalCount(delta); account.setTotalCountSurplus(delta);
                    account.setDayCount(delta); account.setDayCountSurplus(delta);
                    account.setMonthCount(delta); account.setMonthCountSurplus(delta);
                    if (activityAccountMapper.updateAccount(account) != 1) throw new IllegalStateException("Quota account missing");
                    ActivityAccountDay day = new ActivityAccountDay();
                    day.setUserId(userId); day.setActivityId(userCountAwardEntity.getActivityId());
                    day.setDay(java.time.LocalDate.now().toString()); day.setDayCount(delta); day.setDayCountSurplus(delta);
                    activityAccountDayMapper.updateAccount(day);
                    ActivityAccountMonth month = new ActivityAccountMonth();
                    month.setUserId(userId); month.setActivityId(userCountAwardEntity.getActivityId());
                    month.setMonth(java.time.YearMonth.now().toString()); month.setMonthCount(delta); month.setMonthCountSurplus(delta);
                    activityAccountMonthMapper.updateAccount(month);

                    // 记录抽奖次数流水
                    activityRecordMapper.insert(activityRecord);

                    // 更新中奖记录状态为completed 发奖完成
                    int count = userAwardRecordMapper.update(userAwardRecord, new LambdaUpdateWrapper<UserAwardRecord>().eq(UserAwardRecord::getUserOrderId, userAwardRecordEntity.getUserOrderId()));
                    log.debug("[UserAwardRepositoryImpl]更新中奖记录状态为 completed 发奖完成成功 userId:{}", userId);
                    if (count == 0) {
                        log.error("[UserAwardRepositoryImpl]更新中奖记录状态为 completed 发奖完成失败 userId:{}", userId);
                        throw new IllegalStateException("Award settlement update failed");
                    }
                    return 1;
                } catch (DuplicateKeyException e) {
                    status.setRollbackOnly();
                    log.error("[UserAwardRepositoryImpl]更新中奖记录，唯一索引冲突 userId: {} ", userId, e);
                    throw new AppException(ResponseCode.INDEX_DUP.getCode(), e);
                }
            });
        } finally {
            dbRouter.clear();
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }

    }

    @Override
    public void saveThanksPrizes(UserAwardRecordEntity userAwardRecordEntity) {
        String userId = userAwardRecordEntity.getUserId();
        UserAwardRecord userAwardRecord = new UserAwardRecord();
        userAwardRecord.setAwardState(userAwardRecordEntity.getAwardState().getCode());
        try {
            dbRouter.doRouter(userId);
            transactionTemplate.execute(status -> {
                try {
                    // 更新中奖记录状态为completed 发奖完成
                    int count = userAwardRecordMapper.update(userAwardRecord, new LambdaUpdateWrapper<UserAwardRecord>().eq(UserAwardRecord::getUserOrderId, userAwardRecordEntity.getUserOrderId()));
                    log.debug("[UserAwardRepositoryImpl]更新中奖记录状态为 completed 发奖完成成功 userId:{}", userId);
                    if (count == 0) {
                        log.error("[UserAwardRepositoryImpl]更新中奖记录状态为 completed 发奖完成失败 userId:{}", userId);
                        throw new IllegalStateException("Award settlement update failed");
                    }
                    return 1;
                } catch (DuplicateKeyException e) {
                    status.setRollbackOnly();
                    log.error("[UserAwardRepositoryImpl]更新中奖记录，唯一索引冲突 userId: {} ", userId, e);
                    throw new AppException(ResponseCode.INDEX_DUP.getCode(), e);
                }
            });
        } finally {
            dbRouter.clear();
        }
    }

    @Override
    public String queryAwardConfig(Long awardId) {
        LambdaQueryWrapper<Award> queryWrapper = new QueryWrapper<Award>().lambda()
                .eq(Award::getId, awardId);
        Award award = awardMapper.selectOne(queryWrapper);
        return award.getAwardConfig();
    }
}
