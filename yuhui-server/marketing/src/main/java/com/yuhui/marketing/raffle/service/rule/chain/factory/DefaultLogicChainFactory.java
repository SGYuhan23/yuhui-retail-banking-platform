package com.yuhui.marketing.raffle.service.rule.chain.factory;
import com.yuhui.marketing.raffle.repository.StrategyRepository;
import com.yuhui.marketing.raffle.model.entity.RuleEntity;
import com.yuhui.marketing.raffle.service.rule.chain.LogicChain;
import com.yuhui.types.common.Constants;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DefaultLogicChainFactory {
    private final Map<String, LogicChain> policies;
    private final StrategyRepository repository;
    public DefaultLogicChainFactory(Map<String, LogicChain> policies, StrategyRepository repository) {
        this.policies = policies;
        this.repository = repository;
    }
    public LogicChain getLogicChain(Long strategyId) {
        String[] configured = repository.queryStrategyEntityByStrategyId(strategyId).ruleModels();
        List<LogicChain> ordered = new ArrayList<>();
        if (configured != null) {
            for (String name : configured) ordered.add(policies.get(policyKey(name)));
        }
        ordered.add(policies.get(Constants.RuleModel.DEFAULT));
        // Each draw owns its ordering; Spring singleton policies contain no mutable next pointer.
        return (user, strategy, activity) -> {
            for (LogicChain policy : ordered) {
                RuleEntity result = policy.logic(user, strategy, activity);
                if (result != null) return result;
            }
            return null;
        };
    }
    private String policyKey(String configured) {
        if (configured.contains(Constants.RuleModel.RULE_BLACKLIST)) return Constants.RuleModel.RULE_BLACKLIST;
        if (configured.contains(Constants.RuleModel.RULE_WIGHT)) return Constants.RuleModel.RULE_WIGHT;
        return null;
    }
}
