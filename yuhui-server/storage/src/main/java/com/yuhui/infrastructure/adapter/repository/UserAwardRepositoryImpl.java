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
public class UserAwardRepositoryImpl implements UserAwardRepository {
    @Resource
    private UserAwardRecordMapper userAwardRecordMapper;
    @Resource
    private TaskMapper taskMapper;
    @Resource
    private UserOrderMapper userOrderMapper;

    @Resource
    private AwardMapper awardMapper;
    @Resource
    private IDBRouterStrategy dbRouter;
    @Resource
    private TransactionTemplate transactionTemplate;
    @Resource
    private com.yuhui.infrastructure.event.CommittedOutboxDelivery committedDelivery;








    @Override
    public void saveUserAwardRecord(UserAwardRecordAggregate userAwardRecordAggregate) {
        UserAwardRecordEntity userAwardRecordEntity = userAwardRecordAggregate.getUserAwardRecordEntity();
        UserAwardRecord userAwardRecord = new UserAwardRecord();
        BeanUtils.copyProperties(userAwardRecordEntity, userAwardRecord);
        userAwardRecord.setAwardState(userAwardRecordEntity.getAwardState().getCode());

        TaskEntity taskEntity = userAwardRecordAggregate.getTaskEntity();
        Task task = new Task();
        BeanUtils.copyProperties(taskEntity, task);
        task.setMessage(JSON.toJSONString(taskEntity.getMessage()));
        task.setState(taskEntity.getState().getCode());

        UserOrder userOrder = new UserOrder();
        userOrder.setId(userAwardRecordEntity.getUserOrderId());
        userOrder.setUserId(userAwardRecordEntity.getUserId());
        userOrder.setActivityId(userAwardRecordEntity.getActivityId());
        //将中奖记录和任务写入数据库表，更新抽奖单状态为used已使用
        try {
            dbRouter.doRouter(userAwardRecordEntity.getUserId());
            transactionTemplate.execute(status -> {
                try {
                    userAwardRecordMapper.insert(userAwardRecord);
                    taskMapper.insert(task);
                    //更新抽奖单
                    int count = userOrderMapper.updateUserOrderStateUsed(userOrder);
                    if (count != 1) {
                        status.setRollbackOnly();
                        log.error("[UserAwardRepositoryImpl]更新抽奖单失败,该抽奖单已被使用 orderId: {}", userOrder.getId());
                        return new AppException(ResponseCode.ACTIVITY_ORDER_ERROR.getCode(), ResponseCode.ACTIVITY_ORDER_ERROR.getMessage());
                    }
                    return 1;
                } catch (DuplicateKeyException e) {
                    status.setRollbackOnly();
                    log.error("[UserAwardRepositoryImpl]写入中奖记录失败，唯一索引冲突 userId: {} activityId: {} awardId: {}", userAwardRecordEntity.getUserId(), userAwardRecordEntity.getActivityId(), userAwardRecordEntity.getAwardId(), e);
                    throw new AppException(ResponseCode.INDEX_DUP.getCode(), ResponseCode.INDEX_DUP.getMessage());
                }
            });
        } finally {
            dbRouter.clear();
        }

        //发送mq消息
        committedDelivery.attempt(task, taskEntity.getTopic(), taskEntity.getMessage());
    }



    @Override
    public String queryAwardKey(Long awardId) {
        LambdaQueryWrapper<Award> queryWrapper = new QueryWrapper<Award>().lambda()
                .eq(Award::getId, awardId);
        Award award = awardMapper.selectOne(queryWrapper);
        return award.getAwardKey();
    }






}
