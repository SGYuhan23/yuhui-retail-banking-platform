package com.yuhui.marketing.reward.fulfillment.repository;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.*;
import com.yuhui.marketing.reward.fulfillment.model.entity.UserAwardRecordEntity;
/** Atomic fulfillment and replay protection, separate from issuance and its outbox. */
public interface RewardSettlement {
    void saveGiveOutPrizes(GiveOutPrizesAggregate giveOutPrizesAggregate);
    void saveCountPrizes(CountPrizesAggregate countPrizesAggregate);
    void saveThanksPrizes(UserAwardRecordEntity userAwardRecord);
    String queryAwardConfig(Long awardId);
}
