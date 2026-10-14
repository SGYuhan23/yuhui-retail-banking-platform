package com.yuhui.marketing.reward.fulfillment.service.distribute;

import com.yuhui.marketing.reward.fulfillment.model.aggregate.*;
import com.yuhui.marketing.reward.fulfillment.model.entity.*;
import com.yuhui.marketing.reward.fulfillment.model.valobj.AwardStateVO;
import com.yuhui.marketing.reward.fulfillment.repository.RewardSettlement;
import com.yuhui.types.common.Constants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.math.MathContext;

/** Handler keys are persisted configuration, so bean identities remain compatible. */
@Configuration
public class RewardFulfillmentHandlers {
    private final RewardSettlement ledger;
    public RewardFulfillmentHandlers(RewardSettlement ledger) { this.ledger=ledger; }

    @Bean(Constants.AwardModel.RULE_BLACKLIST)
    public DistributeAward fixedCredit() {
        return award -> credit(award, new BigDecimal(configuration(award)));
    }
    @Bean(Constants.AwardModel.USER_CREDIT_RANDOM)
    public DistributeAward randomCredit() {
        return award -> {
            String config=configuration(award);
            String[] bounds=config.split(",");
            if(bounds.length!=2) throw new RuntimeException("award_config 「" + config + "」配置不是一个范围值，如 1,100");
            BigDecimal min=new BigDecimal(bounds[0]), max=new BigDecimal(bounds[1]);
            // Keep the existing distribution and three-significant-digit rounding contract.
            BigDecimal amount=min.add(BigDecimal.valueOf(Math.random()).multiply(max.subtract(min))).round(new MathContext(3));
            credit(award,amount);
        };
    }
    @Bean(Constants.AwardModel.USER_CJ)
    public DistributeAward participationQuota() {
        return award -> {
            UserCountAwardEntity quota=CountPrizesAggregate.buildUserCountAwardEntity(award.getUserId(),award.getActivityId(),Integer.valueOf(award.getAwardConfig()));
            CountPrizesAggregate plan=new CountPrizesAggregate();
            plan.setUserId(award.getUserId());plan.setUserCountAwardEntity(quota);plan.setUserAwardRecordEntity(completed(award));
            ledger.saveCountPrizes(plan);
        };
    }
    @Bean(Constants.AwardModel.THANKS)
    public DistributeAward acknowledgement() { return award -> ledger.saveThanksPrizes(completed(award)); }

    private String configuration(DistributeAwardEntity award) {
        String config=award.getAwardConfig();
        return config==null || config.isEmpty() ? ledger.queryAwardConfig(award.getAwardId()) : config;
    }
    private UserAwardRecordEntity completed(DistributeAwardEntity award) {
        UserAwardRecordEntity record=new UserAwardRecordEntity();
        record.setId(award.getId());record.setUserId(award.getUserId());record.setActivityId(award.getActivityId());
        record.setUserOrderId(award.getUserOrderId());record.setAwardId(award.getAwardId());record.setAwardState(AwardStateVO.complete);
        return record;
    }
    private void credit(DistributeAwardEntity award, BigDecimal amount) {
        GiveOutPrizesAggregate plan=new GiveOutPrizesAggregate();
        plan.setUserId(award.getUserId());plan.setUserAwardRecordEntity(completed(award));
        plan.setUserCreditAwardEntity(GiveOutPrizesAggregate.buildUserCreditAwardEntity(award.getUserId(),award.getActivityId(),amount));
        ledger.saveGiveOutPrizes(plan);
    }
}
