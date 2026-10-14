package com.yuhui.marketing;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.Map;
import com.yuhui.marketing.raffle.service.rule.chain.LogicChain;
import com.yuhui.marketing.raffle.service.rule.chain.factory.DefaultLogicChainFactory;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.model.entity.*;
import com.yuhui.marketing.participation.service.quota.rule.ActivityChain;
import com.yuhui.marketing.participation.service.quota.rule.factory.DefaultActivityChainFactory;
import com.yuhui.types.common.Constants;
class PolicyCompositionTest {
    @Test void constructingAnotherStrategyCannotChangeAnExistingDraw() {
        var repository = mock(StrategyRepository.class);
        var first = new StrategyEntity(); first.setRuleModels("rule_blacklist,rule_weight");
        var second = new StrategyEntity(); second.setRuleModels("rule_blacklist");
        when(repository.queryStrategyEntityByStrategyId(1L)).thenReturn(first);
        when(repository.queryStrategyEntityByStrategyId(2L)).thenReturn(second);
        LogicChain pass = (u,s,a) -> null;
        LogicChain weighted = (u,s,a) -> RuleEntity.builder().awardId(11L).build();
        LogicChain fallback = (u,s,a) -> RuleEntity.builder().awardId(22L).build();
        var factory = new DefaultLogicChainFactory(Map.of(Constants.RuleModel.RULE_BLACKLIST,pass,
                Constants.RuleModel.RULE_WIGHT,weighted,Constants.RuleModel.DEFAULT,fallback),repository);
        var firstDraw = factory.getLogicChain(1L);
        var secondDraw = factory.getLogicChain(2L);
        assertEquals(11L,firstDraw.logic("u",1L,3L).getAwardId());
        assertEquals(22L,secondDraw.logic("u",2L,3L).getAwardId());
        assertEquals(11L,firstDraw.logic("u",1L,3L).getAwardId());
    }
    @Test void admissionFailureCannotReserveInventory() {
        var admission = mock(ActivityChain.class); var stock = mock(ActivityChain.class);
        when(admission.action(null,null,null)).thenThrow(new IllegalArgumentException("closed"));
        var factory = new DefaultActivityChainFactory(Map.of(Constants.ActivityModel.ACTIVITY_BASE,admission,
                Constants.ActivityModel.ACTIVITY_SKU_STOCK,stock));
        assertThrows(IllegalArgumentException.class,()->factory.openActivityChain().action(null,null,null));
        verifyNoInteractions(stock);
    }
}
