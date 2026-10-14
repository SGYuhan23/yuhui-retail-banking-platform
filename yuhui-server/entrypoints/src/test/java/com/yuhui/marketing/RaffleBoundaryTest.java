package com.yuhui.marketing;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.yuhui.marketing.raffle.service.*;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.event.SendLotteryMessageEvent;
import com.yuhui.marketing.raffle.model.entity.*;
import com.yuhui.types.common.Constants;
import com.yuhui.types.exception.AppException;
class RaffleBoundaryTest {
 @Test void specialChainAwardDoesNotEnterTreeOrPublishNotification() {
  var repo=mock(StrategyRepository.class);var rules=mock(RaffleRuleSelection.class);var event=mock(SendLotteryMessageEvent.class);
  when(rules.select("u",2L,3L)).thenReturn(RuleEntity.builder().awardId(7L).ruleModel("blacklist").build());
  when(repo.queryActivityAwardEntity(3L,7L)).thenReturn(mock(StrategyAwardEntity.class));
  var result=new RaffleExecution(repo,rules,event).doLottery(LotteryReqEntity.builder().userId("u").strategyId(2L).activityId(3L).build());
  assertEquals(7L,result.getAwardId());verify(rules,never()).resolve(any(),any(),any(),any());verifyNoInteractions(event);
 }
 @Test void defaultSelectionResolvesTreeBeforePublishing() {
  var repo=mock(StrategyRepository.class);var rules=mock(RaffleRuleSelection.class);var event=mock(SendLotteryMessageEvent.class);
  when(rules.select("u",2L,3L)).thenReturn(RuleEntity.builder().awardId(7L).ruleModel(Constants.RuleModel.DEFAULT).build());
  when(rules.resolve("u",2L,3L,7L)).thenReturn(RuleEntity.builder().awardId(8L).build());
  when(repo.queryActivityAwardEntity(3L,8L)).thenReturn(mock(StrategyAwardEntity.class));
  var result=new RaffleExecution(repo,rules,event).doLottery(LotteryReqEntity.builder().userId("u").strategyId(2L).activityId(3L).build());
  assertEquals(8L,result.getAwardId());verify(event).buildEventMessage(any());verify(repo).sendLotteryMessageToMq(any(),any());
 }
 @Test void invalidRequestDoesNotSelectRules() {
  var repo=mock(StrategyRepository.class);var rules=mock(RaffleRuleSelection.class);var event=mock(SendLotteryMessageEvent.class);
  assertThrows(AppException.class,()->new RaffleExecution(repo,rules,event).doLottery(LotteryReqEntity.builder().userId("u").build()));
  verifyNoInteractions(repo,rules,event);
 }
}
