package com.yuhui.infrastructure.adapter.repository;

import cn.bugstack.middleware.db.router.strategy.IDBRouterStrategy;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.yuhui.marketing.points.model.aggregate.TradeAggregate;
import com.yuhui.marketing.points.model.entity.CreditAccountEntity;
import com.yuhui.marketing.points.model.entity.CreditOrderEntity;
import com.yuhui.marketing.points.model.entity.TaskEntity;
import com.yuhui.marketing.points.model.valobj.CreditAccountStatusVO;
import com.yuhui.marketing.points.model.valobj.TradeTypeVO;
import com.yuhui.marketing.points.repository.CreditRepository;
import com.yuhui.infrastructure.dao.po.CreditRecord;
import com.yuhui.infrastructure.dao.CreditAccountMapper;
import com.yuhui.infrastructure.dao.TaskMapper;
import com.yuhui.infrastructure.dao.CreditRecordMapper;
import com.yuhui.infrastructure.dao.po.CreditAccount;
import com.yuhui.infrastructure.dao.po.Task;
import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;

import javax.annotation.Resource;
import java.math.BigDecimal;
import com.yuhui.types.exception.AppException;
import com.yuhui.types.enums.ResponseCode;

/**

 * 积分领域仓储实现
 */
@Repository
@Slf4j
public class CreditRepositoryImpl implements CreditRepository {
    @Resource
    private RedisService redisService;
    @Resource
    private CreditAccountMapper creditAccountMapper;
    @Resource
    private CreditRecordMapper creditRecordMapper;
    @Resource
    private TaskMapper taskMapper;
    @Resource
    private IDBRouterStrategy dbRouter;
    @Resource
    private TransactionTemplate transactionTemplate;
    @Resource
    private com.yuhui.infrastructure.event.CommittedOutboxDelivery committedDelivery;

    @Override
    public void saveTradeAggregate(TradeAggregate tradeAggregate) {
        String userId = tradeAggregate.getUserId();
        CreditAccountEntity creditAccountEntity = tradeAggregate.getCreditAccountEntity();
        CreditOrderEntity creditOrderEntity = tradeAggregate.getCreditOrderEntity();
        TaskEntity taskEntity = tradeAggregate.getTaskEntity();

        CreditAccount creditAccount = new CreditAccount();
        BigDecimal creditAmount = creditAccountEntity.getCreditAmount();
        creditAccount.setUserId(userId);
        creditAccount.setActivityId(creditAccountEntity.getActivityId());
        creditAccount.setAccountStatus(CreditAccountStatusVO.OPEN.getCode());
        creditAccount.setTotalAmount(creditAmount);
        creditAccount.setAvailableAmount(creditAccountEntity.getCreditAmount());

        CreditRecord creditRecord = new CreditRecord();
        creditRecord.setUserId(userId);
        creditRecord.setActivityId(creditOrderEntity.getActivityId());
        creditRecord.setTradeName(creditOrderEntity.getTradeName().getName());
        creditRecord.setTradeType(creditOrderEntity.getTradeType().getCode());
        creditRecord.setTradeAmount(creditOrderEntity.getTradeAmount());
        creditRecord.setOutBusinessNo(creditOrderEntity.getOutBusinessNo());

        Task task = new Task();
        task.setUserId(taskEntity.getUserId());
        task.setActivityId(taskEntity.getActivityId());
        task.setTopic(taskEntity.getTopic());
        task.setMessageId(taskEntity.getMessageId());
        task.setMessage(JSON.toJSONString(taskEntity.getMessage()));
        task.setState(taskEntity.getState().getCode());

        RLock lock = redisService.getLock(Constants.RedisKey.CREDIT_ACCOUNT_LOCK + userId + Constants.UNDERLINE + creditOrderEntity.getActivityId());

        try {
            lock.lock();
            dbRouter.doRouter(userId);
            transactionTemplate.execute(status -> {
                try {
                    // 保存账户
                    LambdaQueryWrapper<CreditAccount> queryWrapper = new QueryWrapper<CreditAccount>().lambda()
                            .eq(CreditAccount::getUserId, userId)
                            .eq(CreditAccount::getActivityId, creditOrderEntity.getActivityId());
                    CreditAccount account = creditAccountMapper.selectOne(queryWrapper);
                    if (account == null) {
                        // A debit must never create an account or mint credits.
                        if (creditOrderEntity.getTradeType() == TradeTypeVO.REVERSE) {
                            throw new AppException(ResponseCode.USER_CREDIT_ACCOUNT_NO_AVAILABLE_AMOUNT.getCode(), "积分不足");
                        }
                        creditAccountMapper.insert(creditAccount);
                        log.debug("[CreditRepositoryImpl]创建积分账户成功 userId:{}", userId);
                    } else if (creditOrderEntity.getTradeType() == TradeTypeVO.FORWARD) {
                        // 增加(可用)
                        creditAccountMapper.update(creditAccount);
                        log.debug("[CreditRepositoryImpl]增加积分账户成功 userId:{}", userId);
                    } else {
                        // 减少(可用)
                        if (creditAccountMapper.reduce(creditAccount) != 1) {
                            throw new AppException(ResponseCode.USER_CREDIT_ACCOUNT_NO_AVAILABLE_AMOUNT.getCode(), "积分不足或账户不可用");
                        }
                        log.debug("[CreditRepositoryImpl]减少积分账户成功 userId:{}", userId);
                    }
                    // 保存订单
                    creditRecordMapper.insert(creditRecord);
                    log.debug("[CreditRepositoryImpl]保存积分订单成功 userId:{}", userId);
                    // 写入任务
                    taskMapper.insert(task);
                    log.debug("[CreditRepositoryImpl]写入积分任务成功 userId:{}", userId);
                } catch (DuplicateKeyException e) {
                    status.setRollbackOnly();
                    throw new AppException(ResponseCode.INDEX_DUP.getCode(), "重复积分交易", e);
                } catch (Exception e) {
                    status.setRollbackOnly();
                    throw e;
                }
                return 1;
            });
        } finally {
            dbRouter.clear();
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }

        //发送mq消息 不用加在事务里，因为有事务补偿机制
        committedDelivery.attempt(task, taskEntity.getTopic(), taskEntity.getMessage());
    }

    @Override
    public CreditAccountEntity queryUserCreditAccount(String userId,Long activityId) {
        try {
            dbRouter.doRouter(userId);
            LambdaQueryWrapper<CreditAccount> queryWrapper = new QueryWrapper<CreditAccount>().lambda()
                    .eq(CreditAccount::getUserId, userId)
                    .eq(CreditAccount::getActivityId, activityId);
            CreditAccount creditAccount = creditAccountMapper.selectOne(queryWrapper);
            if (creditAccount == null) {
                return CreditAccountEntity.builder()
                        .userId(userId)
                        .creditAmount(BigDecimal.ZERO)
                        .build();
            }
            return CreditAccountEntity.builder()
                    .userId(creditAccount.getUserId())
                    .creditAmount(creditAccount.getAvailableAmount())
                    .build();
        } finally {
            dbRouter.clear();
        }

    }
}
