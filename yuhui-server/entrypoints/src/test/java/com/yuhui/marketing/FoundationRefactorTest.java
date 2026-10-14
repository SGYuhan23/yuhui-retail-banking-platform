package com.yuhui.marketing;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
import com.yuhui.marketing.task.repository.*;
import com.yuhui.marketing.task.service.TaskServiceImpl;
import com.yuhui.marketing.task.model.entity.TaskEntity;
import com.yuhui.marketing.reward.behavior.service.*;
import com.yuhui.marketing.reward.behavior.repository.RebateRepository;
import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
import com.yuhui.marketing.reward.behavior.model.valobj.RebateVO;
import com.yuhui.marketing.reward.behavior.model.aggregate.RebateAggregate;
import com.yuhui.types.exception.AppException;
class FoundationRefactorTest {
 @Test void outboxConfirmFailureIsRetryableAndLaterTasksStillRun() {
  var ledger=mock(TaskRepository.class);var sender=mock(TaskMessagePublisher.class);
  var first=new TaskEntity();first.setUserId("u");first.setMessageId("1");
  var second=new TaskEntity();second.setUserId("u");second.setMessageId("2");
  when(ledger.queryNoSendMessageTaskList()).thenReturn(List.of(first,second));
  doThrow(new IllegalStateException("confirm failed")).when(sender).publish(first);
  new TaskServiceImpl(ledger,sender).dispatchPendingBatch();
  verify(ledger).updateTaskSendMessageFail("u","1");verify(ledger,never()).updateTaskSendMessageCompleted("u","1");
  var order=inOrder(sender,ledger);order.verify(sender).publish(second);order.verify(ledger).updateTaskSendMessageCompleted("u","2");
 }
 @Test void failedCompletionWriteRemainsRetryable() {
  var ledger=mock(TaskRepository.class);var sender=mock(TaskMessagePublisher.class);var task=new TaskEntity();task.setUserId("u");task.setMessageId("x");
  when(ledger.queryNoSendMessageTaskList()).thenReturn(List.of(task));doThrow(new IllegalStateException()).when(ledger).updateTaskSendMessageCompleted("u","x");
  new TaskServiceImpl(ledger,sender).dispatchPendingBatch();verify(ledger).updateTaskSendMessageFail("u","x");
 }
 @Test void rewardBatchSkipsDuplicateButGiftRejectsIt() {
  var ledger=mock(RebateRepository.class);var plans=mock(BehaviorRewardPlanFactory.class);var behavior=new BehaviorEntity();behavior.setUserId("u");behavior.setActivityId(9L);
  var config=RebateVO.builder().behaviorRebateId(5L).build();
  when(ledger.queryRebateConfig(behavior)).thenReturn(List.of(config));when(ledger.queryOneRebateConfig(behavior)).thenReturn(config);when(ledger.isReceiveGift("9",5L,"u")).thenReturn(true);
  var service=new RebateServiceImpl(ledger,plans);assertEquals(List.of(),service.createRebateOrder(behavior));verify(ledger).saveRebateAggregate(List.of());
  assertThrows(AppException.class,()->service.createRebateOrderOfGift(behavior));verifyNoInteractions(plans);
 }
 @Test void multiRewardIsSavedAsOneAtomicBatch() {
  var ledger=mock(RebateRepository.class);var plans=mock(BehaviorRewardPlanFactory.class);var b=new BehaviorEntity();b.setUserId("u");b.setActivityId(9L);
  var a=RebateVO.builder().behaviorRebateId(1L).build();var c=RebateVO.builder().behaviorRebateId(2L).build();
  var x=mock(RebateAggregate.class,RETURNS_DEEP_STUBS);var y=mock(RebateAggregate.class,RETURNS_DEEP_STUBS);
  when(x.getRebateOrderEntity().getOrderId()).thenReturn("a");when(y.getRebateOrderEntity().getOrderId()).thenReturn("b");
  when(ledger.queryRebateConfig(b)).thenReturn(List.of(a,c));when(plans.prepare(b,a)).thenReturn(x);when(plans.prepare(b,c)).thenReturn(y);
  assertEquals(List.of("a","b"),new RebateServiceImpl(ledger,plans).createRebateOrder(b));verify(ledger,times(1)).saveRebateAggregate(List.of(x,y));
 }
}
