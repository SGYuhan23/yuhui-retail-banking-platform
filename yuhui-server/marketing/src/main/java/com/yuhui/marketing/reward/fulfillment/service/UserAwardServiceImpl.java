package com.yuhui.marketing.reward.fulfillment.service;
import com.yuhui.marketing.reward.fulfillment.model.entity.*;
import com.yuhui.marketing.reward.fulfillment.repository.UserAwardRepository;
import com.yuhui.marketing.reward.fulfillment.service.distribute.DistributeAward;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service
public class UserAwardServiceImpl implements UserAwardService {
    private final UserAwardRepository ledger;
    private final AwardIssuancePlan plans;
    private final Map<String,DistributeAward> handlers;
    public UserAwardServiceImpl(UserAwardRepository ledger,AwardIssuancePlan plans,Map<String,DistributeAward> handlers) {
        this.ledger=ledger;this.plans=plans;this.handlers=handlers;
    }
    @Override public void saveUserAwardRecord(UserAwardRecordEntity record) { ledger.saveUserAwardRecord(plans.prepare(record)); }
    @Override public void distributeAward(DistributeAwardEntity award) {
        String key=ledger.queryAwardKey(award.getAwardId());
        DistributeAward handler=handlers.get(key);
        if(handler==null) throw new IllegalStateException("Award handler is not configured: " + key);
        handler.giveOutPrizes(award);
    }
}
