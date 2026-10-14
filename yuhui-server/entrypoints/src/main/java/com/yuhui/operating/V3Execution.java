package com.yuhui.operating;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;
import java.sql.*;
import java.time.*;
import java.util.*;
import static com.yuhui.operating.V3Store.*;

@Service @Profile("local")
public class V3Execution {
    final V3Store db;
    public V3Execution(V3Store db){this.db=db;}
    public Map<String,Object> run(Connection c,long id)throws Exception{return one(c,"SELECT r.*,v.config_json FROM v3_campaign_run r JOIN v3_campaign_version v ON v.id=r.campaign_version_id WHERE r.id=?",id);}
    private Map<String,Object> lock(Connection c,long id)throws Exception{
        one(c,"SELECT * FROM v3_campaign_budget WHERE campaign_run_id=? FOR UPDATE",id);return run(c,id);
    }
    public Map<String,Object> budget(Connection c,long id)throws Exception{
        Map<String,Object> b=one(c,"SELECT COALESCE(SUM(reserved_delta),0) reserved,COALESCE(SUM(committed_delta),0) committed,COALESCE(SUM(CASE WHEN operation_type='RELEASE' THEN bank_amount ELSE 0 END),0) released FROM v3_budget_ledger WHERE campaign_run_id=?",id);
        long total=n(one(c,"SELECT total FROM v3_campaign_budget WHERE campaign_run_id=?",id).get("total"));b.put("total",total);b.put("available",total-n(b.get("reserved"))-n(b.get("committed")));b.put("utilization",total==0?0:(double)n(b.get("committed"))/total);return b;
    }
    private void active(Map<String,Object> run,LocalDateTime now){require("RUNNING".equals(run.get("status")),"批次未运行");require(!now.isBefore(V3Campaigns.time(run.get("start_time")))&&!now.isAfter(V3Campaigns.time(run.get("end_time"))),"不在活动执行窗口");}
    private void eligible(Connection c,Map<String,Object> r,String customer)throws Exception{
        one(c,"SELECT customer_id FROM v3_segment_snapshot_member WHERE snapshot_id=? AND customer_id=?",r.get("segment_snapshot_id"),customer);
        Map<String,Object> user=one(c,"SELECT * FROM v3_customer WHERE customer_id=? FOR UPDATE",customer);require(Boolean.TRUE.equals(user.get("marketing_consent"))||n(user.get("marketing_consent"))==1,"客户未许可营销触达");
    }
    public boolean event(Connection c,Map<String,Object> r,String customer,String type,Long merchant,String ref,long bank,long contribution,LocalDateTime now,Map<String,Object> meta)throws Exception{
        Map<String,Object> cfg=obj(r.get("config_json"));
        // One customer stage event per run. Semantic key, not caller-provided arbitrary key.
        return exec(c,"INSERT IGNORE INTO v3_event_ledger(campaign_id,campaign_run_id,customer_id,segment_snapshot_id,event_type,merchant_id,scene_id,benefit_id,bank_cost,merchant_cost,business_ref_id,idempotency_key,occurred_at,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",r.get("campaign_id"),r.get("id"),customer,r.get("segment_snapshot_id"),type,merchant,cfg.get("scene_id"),cfg.get("benefit_id"),bank,contribution,ref,r.get("id")+":"+type+":"+customer,now,json(meta))==1;
    }
    private boolean has(Connection c,long run,String customer,String type)throws Exception{return !rows(c,"SELECT id FROM v3_event_ledger WHERE campaign_run_id=? AND customer_id=? AND event_type=?",run,customer,type).isEmpty();}
    public Map<String,Object> record(Connection c,long runId,String customer,String type,String action,LocalDateTime now)throws Exception{
        require(Set.of("DELIVERED","PARTICIPATED","TARGET_ACTION_COMPLETED").contains(type),"此事件只能由业务履约产生");Map<String,Object> r=lock(c,runId);active(r,now);eligible(c,r,customer);
        Long mid=null;
        if(type.equals("PARTICIPATED"))require(has(c,runId,customer,"DELIVERED"),"请先记录有效模拟触达");
        if(type.equals("TARGET_ACTION_COMPLETED")){
            require(has(c,runId,customer,"REDEEMED"),"本案例先核销，再观察目标行为");require(s(obj(r.get("config_json")).get("target_metric")).equals(action),"目标行为须与发布定义一致");
            mid=n(one(c,"SELECT merchant_id FROM v3_entitlement WHERE campaign_run_id=? AND customer_id=?",runId,customer).get("merchant_id"));
        }
        boolean created=event(c,r,customer,type,mid,"mock:"+runId+":"+customer,0,0,now,Map.of("mock_data",true,"action",Objects.toString(action,""),"causal_claim",false));return Map.of("created",created);
    }
    private void ledger(Connection c,Map<String,Object> e,String type,long reserved,long committed,LocalDateTime now)throws Exception{
        exec(c,"INSERT INTO v3_budget_ledger(campaign_run_id,customer_id,benefit_id,operation_type,reserved_delta,committed_delta,bank_amount,business_ref_id,idempotency_key,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",e.get("campaign_run_id"),e.get("customer_id"),e.get("benefit_id"),type,reserved,committed,e.get("bank_cost"),e.get("code"),type+":"+e.get("code"),now);
    }
    public Map<String,Object> claim(Connection c,long runId,String customer,long merchant,LocalDateTime now)throws Exception{
        Map<String,Object> r=lock(c,runId);active(r,now);eligible(c,r,customer);Map<String,Object> cfg=obj(r.get("config_json")),b=(Map<String,Object>)cfg.get("benefit");
        require(((List<?>)cfg.get("merchant_ids")).stream().anyMatch(x->n(x)==merchant),"商户不在发布范围内");
        require("ACTIVE".equals(one(c,"SELECT status FROM v3_merchant WHERE id=?",merchant).get("status")),"商户已停用");
        List<Map<String,Object>> existing=rows(c,"SELECT * FROM v3_entitlement WHERE campaign_run_id=? AND customer_id=? AND benefit_id=?",runId,customer,cfg.get("benefit_id"));
        require(existing.isEmpty(),"CLAIM_LIMIT_REACHED：每个批次每人限领一次");
        require(has(c,runId,customer,"PARTICIPATED"),"请先完成有效触达和参与");
        long cost=n(b.get("bank_cost"));require(n(budget(c,runId).get("available"))>=cost,"BUDGET_CAP_REACHED：银行预算不足，停止发放");
        require(exec(c,"UPDATE v3_benefit SET issued_stock=issued_stock+1 WHERE id=? AND issued_stock<total_stock AND status='ACTIVE'",cfg.get("benefit_id"))==1,"权益库存不足或已停用");
        long price=n(b.get("points_price"));
        if(price>0)require(exec(c,"UPDATE v3_customer SET points_balance=points_balance-? WHERE customer_id=? AND points_balance>=?",price,customer,price)==1,"合成客户积分不足");
        String code="YH-"+runId+"-"+customer;
        Map<String,Object> terms=new LinkedHashMap<>(b);terms.put("merchant",one(c,"SELECT id,name,district,scene_id FROM v3_merchant WHERE id=?",merchant));terms.put("mock_data",true);
        insert(c,"INSERT INTO v3_entitlement(code,campaign_run_id,customer_id,benefit_id,merchant_id,status,terms_json,bank_cost,merchant_cost,points_spent,claimed_at,expires_at) VALUES(?,?,?,?,?,'AVAILABLE',?,?,?,?,?,?)",code,runId,customer,cfg.get("benefit_id"),merchant,json(terms),cost,b.get("merchant_cost"),price,now,now.plusDays(n(b.get("valid_days"))));
        Map<String,Object> e=one(c,"SELECT * FROM v3_entitlement WHERE code=?",code);ledger(c,e,"RESERVE",cost,0,now);
        event(c,r,customer,"CLAIMED",merchant,code,0,0,now,Map.of("mock_data",true));
        if(price>0)event(c,r,customer,"POINTS_SPENT",merchant,code,0,0,now,Map.of("mock_data",true,"points",price));return publicEntitlement(e);
    }
    public static Map<String,Object> publicEntitlement(Map<String,Object> e){
        Map<String,Object> out=new LinkedHashMap<>(e);out.remove("bank_cost");out.remove("merchant_cost");Map<String,Object> terms=obj(out.remove("terms_json"));terms.remove("bank_cost");terms.remove("merchant_cost");terms.remove("issued_stock");out.put("terms",terms);return out;
    }
    public Map<String,Object> redeem(Connection c,String code,long merchant,long spend,LocalDateTime now)throws Exception{
        Map<String,Object> first=one(c,"SELECT campaign_run_id FROM v3_entitlement WHERE code=?",code);Map<String,Object> r=lock(c,n(first.get("campaign_run_id")));
        Map<String,Object> e=one(c,"SELECT * FROM v3_entitlement WHERE code=? FOR UPDATE",code);
        require("AVAILABLE".equals(e.get("status")),"权益已核销、到期或取消");require(now.isBefore(V3Campaigns.time(e.get("expires_at"))),"权益已过期，请执行到期释放");require(!now.isBefore(V3Campaigns.time(e.get("claimed_at"))),"核销时间无效");
        require(n(e.get("merchant_id"))==merchant,"不属于允许商户");Map<String,Object> m=one(c,"SELECT * FROM v3_merchant WHERE id=?",merchant),terms=obj(e.get("terms_json"));
        require("ACTIVE".equals(m.get("status"))&&s(m.get("scene_id")).equals(s(terms.get("scene_id"))),"商户状态或场景不匹配");require(spend>=n(terms.get("minimum_spend")),"模拟消费金额未达到使用门槛");
        exec(c,"UPDATE v3_entitlement SET status='REDEEMED',redeemed_at=? WHERE id=?",now,e.get("id"));long cost=n(e.get("bank_cost"));ledger(c,e,"COMMIT",-cost,cost,now);
        event(c,r,s(e.get("customer_id")),"REDEEMED",merchant,code,cost,n(e.get("merchant_cost")),now,Map.of("mock_data",true,"mock_spend",spend));return Map.of("redeemed",true,"code",code);
    }
    public Map<String,Object> release(Connection c,String code,boolean cancel,String customer,LocalDateTime now)throws Exception{
        Map<String,Object> first=one(c,"SELECT campaign_run_id FROM v3_entitlement WHERE code=?",code);Map<String,Object> r=lock(c,n(first.get("campaign_run_id")));
        Map<String,Object> e=one(c,"SELECT * FROM v3_entitlement WHERE code=? FOR UPDATE",code);
        require(!cancel||s(e.get("customer_id")).equals(customer),"权益不属于该演示客户");
        if(!"AVAILABLE".equals(e.get("status")))return Map.of("released",false);
        require(cancel||!now.isBefore(V3Campaigns.time(e.get("expires_at"))),"尚未到期");
        exec(c,"UPDATE v3_entitlement SET status=? WHERE id=?",cancel?"CANCELLED":"EXPIRED",e.get("id"));ledger(c,e,"RELEASE",-n(e.get("bank_cost")),0,now);
        // Cancellation refunds synthetic points; expiration follows frozen use terms (no refund).
        if(cancel&&n(e.get("points_spent"))>0){exec(c,"UPDATE v3_customer SET points_balance=points_balance+? WHERE customer_id=?",e.get("points_spent"),e.get("customer_id"));event(c,r,s(e.get("customer_id")),"POINTS_REFUNDED",n(e.get("merchant_id")),code,0,0,now,Map.of("mock_data",true,"points",e.get("points_spent")));}
        return Map.of("released",true);
    }
    public int expire(Connection c,LocalDateTime now)throws Exception{
        int count=0;for(Map<String,Object> e:rows(c,"SELECT code FROM v3_entitlement WHERE status='AVAILABLE' AND expires_at<=? ORDER BY campaign_run_id,id",now)){release(c,s(e.get("code")),false,"",now);count++;}return count;
    }
    public void end(Connection c,long id)throws Exception{Map<String,Object> r=lock(c,id);exec(c,"UPDATE v3_campaign_run SET status='ENDED' WHERE id=?",id);exec(c,"UPDATE v3_campaign SET status='ENDED' WHERE id=?",r.get("campaign_id"));}
}
