package com.yuhui.marketing;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;
import com.yuhui.marketing.reward.fulfillment.service.distribute.RewardFulfillmentHandlers;
import com.yuhui.marketing.reward.fulfillment.repository.RewardSettlement;
import com.yuhui.marketing.reward.fulfillment.model.entity.DistributeAwardEntity;
import com.yuhui.marketing.reward.fulfillment.model.aggregate.GiveOutPrizesAggregate;
import java.math.BigDecimal;
class RewardFulfillmentTest {
 @Test void fixedCreditUsesFallbackAndPreservesIdentity() {
  var ledger=mock(RewardSettlement.class);var award=mock(DistributeAwardEntity.class);
  when(award.getAwardId()).thenReturn(7L);when(award.getUserId()).thenReturn("u");when(award.getId()).thenReturn(8L);
  when(ledger.queryAwardConfig(7L)).thenReturn("12.50");
  new RewardFulfillmentHandlers(ledger).fixedCredit().giveOutPrizes(award);
  var plan=ArgumentCaptor.forClass(GiveOutPrizesAggregate.class);verify(ledger).saveGiveOutPrizes(plan.capture());
  assertEquals(new BigDecimal("12.50"),plan.getValue().getUserCreditAwardEntity().getCreditAmount());assertEquals(8L,plan.getValue().getUserAwardRecordEntity().getId());
 }
 @Test void randomCreditRetainsRoundingAndInvalidRangeError() {
  var ledger=mock(RewardSettlement.class);var award=mock(DistributeAwardEntity.class);when(award.getAwardConfig()).thenReturn("1234,1234");
  var handler=new RewardFulfillmentHandlers(ledger).randomCredit();handler.giveOutPrizes(award);
  var plan=ArgumentCaptor.forClass(GiveOutPrizesAggregate.class);verify(ledger).saveGiveOutPrizes(plan.capture());
  assertEquals(0,new BigDecimal("1230").compareTo(plan.getValue().getUserCreditAwardEntity().getCreditAmount()));
  when(award.getAwardConfig()).thenReturn("1,2,3");assertThrows(RuntimeException.class,()->handler.giveOutPrizes(award));
 }
}
