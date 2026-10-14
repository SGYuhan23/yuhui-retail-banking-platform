package com.yuhui.operating;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;
import java.sql.*;
import java.util.*;
import static com.yuhui.operating.V3Store.*;

@Service @Profile("local")
public class V3Review {
    final V3Execution execution;
    public V3Review(V3Execution execution){this.execution=execution;}
    public Map<String,Object> review(Connection c,long id)throws Exception{
        // Same lock as execution ensures a coherent multi-query ledger snapshot.
        one(c,"SELECT * FROM v3_campaign_budget WHERE campaign_run_id=? FOR UPDATE",id);
        Map<String,Object> run=execution.run(c,id),cfg=obj(run.get("config_json")),budget=execution.budget(c,id);
        Map<String,Long> funnel=new LinkedHashMap<>();
        funnel.put("SNAPSHOT",n(one(c,"SELECT COUNT(*) n FROM v3_segment_snapshot_member WHERE snapshot_id=?",run.get("segment_snapshot_id")).get("n")));
        for(String type:List.of("DELIVERED","PARTICIPATED","CLAIMED","REDEEMED","TARGET_ACTION_COMPLETED"))funnel.put(type,0L);
        for(Map<String,Object> row:rows(c,"SELECT event_type,COUNT(DISTINCT customer_id) n FROM v3_event_ledger WHERE campaign_run_id=? GROUP BY event_type",id))if(funnel.containsKey(s(row.get("event_type"))))funnel.put(s(row.get("event_type")),n(row.get("n")));
        long actual=n(one(c,"SELECT COUNT(DISTINCT customer_id) n FROM v3_event_ledger WHERE campaign_run_id=? AND event_type='TARGET_ACTION_COMPLETED' AND occurred_at>=? AND occurred_at<=?",id,run.get("start_time"),run.get("end_time")).get("n"));
        funnel.put("TARGET_ACTION_COMPLETED",actual);
        long committed=n(budget.get("committed"));Map<String,Object> out=new LinkedHashMap<>();out.put("run",run);out.put("funnel",funnel);out.put("budget",budget);out.put("bank_cost",committed);
        long target=n(cfg.get("target_value"));
        out.put("target_metric",cfg.get("target_metric"));out.put("target_value",target);out.put("target_actual",actual);out.put("target_delta",actual-target);out.put("target_achievement_rate",target==0?null:(double)actual/target);out.put("target_met",actual>=target);
        out.put("review_as_of",java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Shanghai")).toString());
        out.put("run_start_at",run.get("start_time"));out.put("run_end_at",run.get("end_time"));
        out.put("target_observation_start_at",run.get("start_time"));out.put("target_observation_end_at",run.get("end_time"));
        long outstanding=n(one(c,"SELECT COUNT(*) n FROM v3_entitlement WHERE campaign_run_id=? AND status NOT IN ('REDEEMED','EXPIRED','CANCELLED')",id).get("n"));
        out.put("outstanding_entitlement_count",outstanding);out.put("fulfillment_status",outstanding>0?"ONGOING":"SETTLED");
        out.put("merchant_contribution",n(one(c,"SELECT COALESCE(SUM(merchant_cost),0) amount FROM v3_event_ledger WHERE campaign_run_id=? AND event_type='REDEEMED'",id).get("amount")));
        out.put("cost_per_redeemed_customer",funnel.get("REDEEMED")==0?null:(double)committed/funnel.get("REDEEMED"));out.put("cost_per_target_action_customer",funnel.get("TARGET_ACTION_COMPLETED")==0?null:(double)committed/funnel.get("TARGET_ACTION_COMPLETED"));
        List<String> warnings=new ArrayList<>();Map<String,Object> guard=(Map<String,Object>)cfg.get("guardrail_config");long cost=n(((Map<?,?>)cfg.get("benefit")).get("bank_cost"));
        if(n(budget.get("available"))<cost)warnings.add("BUDGET_CAP_REACHED：可用预算不足以继续发放");
        if(funnel.get("CLAIMED")>0&&(double)funnel.get("REDEEMED")/funnel.get("CLAIMED")<Double.parseDouble(s(guard.get("min_redemption_rate"))))warnings.add("WARNING：核销率低于预设阈值，可考虑减少下一轮额度");
        if(funnel.get("TARGET_ACTION_COMPLETED")>0&&(double)committed/funnel.get("TARGET_ACTION_COMPLETED")>n(guard.get("max_cost_per_target_action")))warnings.add("WARNING：单位目标行为客户银行成本高于阈值");
        if((double)(committed+n(budget.get("reserved")))/n(budget.get("total"))>Double.parseDouble(s(guard.get("max_budget_burn_rate"))))warnings.add("WARNING：预算占用率高于阈值（实扣+预占 / 总预算）");
        out.put("warnings",warnings);Map<String,Object> breakdown=new LinkedHashMap<>();
        for(String dimension:List.of("segment","scene","merchant","benefit")){
            String field=switch(dimension){case "segment"->"e.segment_snapshot_id";case "scene"->"e.scene_id";case "merchant"->"e.merchant_id";default->"e.benefit_id";};
            List<Map<String,Object>> grouped=rows(c,"SELECT "+field+" dimension_id, COUNT(DISTINCT CASE WHEN event_type='CLAIMED' THEN customer_id END) claimed,COUNT(DISTINCT CASE WHEN event_type='REDEEMED' THEN customer_id END) redeemed,COUNT(DISTINCT CASE WHEN event_type='TARGET_ACTION_COMPLETED' AND occurred_at>=? AND occurred_at<=? THEN customer_id END) target_actions,COALESCE(SUM(CASE WHEN event_type='REDEEMED' THEN bank_cost ELSE 0 END),0) bank_cost,COALESCE(SUM(CASE WHEN event_type='REDEEMED' THEN merchant_cost ELSE 0 END),0) merchant_contribution FROM v3_event_ledger e WHERE campaign_run_id=? AND "+field+" IS NOT NULL GROUP BY "+field,run.get("start_time"),run.get("end_time"),id);
            for(Map<String,Object> row:grouped){long claimed=n(row.get("claimed")),redeemed=n(row.get("redeemed"));row.put("redemption_rate",claimed==0?null:(double)redeemed/claimed);String table=switch(dimension){case "segment"->"v3_segment_snapshot";case "scene"->"v3_scene";case "merchant"->"v3_merchant";default->"v3_benefit";};String col=dimension.equals("segment")?"snapshot_name":"name";row.put("name",one(c,"SELECT "+col+" name FROM "+table+" WHERE id=?",row.get("dimension_id")).get("name"));row.put("suggestion",claimed>0&&(double)redeemed/claimed<0.2?"核销率低于 20%，可考虑下一轮减少额度":"观察后人工决策");}
            breakdown.put(dimension,grouped);
        }
        out.put("breakdown",breakdown);out.put("decisions",rows(c,"SELECT * FROM v3_decision_record WHERE campaign_run_id=? ORDER BY id DESC",id));out.put("mock_data",true);out.put("interpretation","目标行为仅计 Run 观察窗口；核销、预算与成本为截至 review_as_of 累计履约事实；合成行为不代表因果增量；金额单位为分。");return out;
    }
    public long decision(Connection c,long id,Map<String,Object> body)throws Exception{
        require(Set.of("EXPAND","KEEP","REDUCE","STOP").contains(s(body.get("decision_type"))),"决策类型无效");require(!s(body.get("reason")).isBlank()&&s(body.get("reason")).length()<=3000,"请填写决策原因（最多 3000 字）");
        Map<String,Object> metrics=review(c,id);require("ENDED".equals(((Map<?,?>)metrics.get("run")).get("status")),"结束批次后记录复盘决策");metrics.remove("decisions");return insert(c,"INSERT INTO v3_decision_record(campaign_run_id,decision_type,reason,metrics_snapshot_json) VALUES(?,?,?,?)",id,body.get("decision_type"),body.get("reason"),json(metrics));
    }
}
