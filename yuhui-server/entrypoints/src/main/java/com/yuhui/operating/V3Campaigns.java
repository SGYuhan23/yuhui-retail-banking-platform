package com.yuhui.operating;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;
import java.sql.*;
import java.time.*;
import java.util.*;
import static com.yuhui.operating.V3Store.*;

@Service @Profile("local")
public class V3Campaigns {
    public static final Set<String> OBJECTIVES=Set.of("CUSTOMER_REACTIVATION","MERCHANT_TRAFFIC","POINTS_BURN");
    public static final Set<String> TARGETS=Set.of("MOCK_COMMUNITY_PURCHASE","MOCK_VALID_ACTIVITY");
    final V3Store db;
    public V3Campaigns(V3Store db){this.db=db;}
    public Map<String,Object> preview(Connection c,Map<String,Object> rule)throws Exception{
        V3Rules.Query q=V3Rules.compile(rule);Object[] a=q.args().toArray();
        return Map.of("count",one(c,"SELECT COUNT(*) count FROM v3_customer WHERE "+q.sql(),a).get("count"),
            "consented_count",one(c,"SELECT COUNT(*) count FROM v3_customer WHERE marketing_consent=1 AND "+q.sql(),a).get("count"),
            "distribution",rows(c,"SELECT lifecycle_stage,asset_tier,COUNT(*) count FROM v3_customer WHERE "+q.sql()+" GROUP BY lifecycle_stage,asset_tier",a));
    }
    public long segment(Connection c,Long id,Map<String,Object> b)throws Exception{
        String name=s(b.get("name"));require(!name.isBlank()&&name.length()<=160,"客群名称无效");Map<String,Object> rule=(Map<String,Object>)b.get("rule");V3Rules.compile(rule);
        if(id==null)return insert(c,"INSERT INTO v3_segment(name,rule_json) VALUES(?,?)",name,json(rule));
        require(exec(c,"UPDATE v3_segment SET name=?,rule_json=? WHERE id=?",name,json(rule),id)==1,"客群不存在");return id;
    }
    public long snapshot(Connection c,long segmentId)throws Exception{
        Map<String,Object> seg=one(c,"SELECT * FROM v3_segment WHERE id=? FOR UPDATE",segmentId);
        V3Rules.Query q=V3Rules.compile(obj(seg.get("rule_json")));
        // Freeze from one SELECT; consent exclusion cannot be bypassed with OR.
        List<Map<String,Object>> members=rows(c,"SELECT * FROM v3_customer WHERE marketing_consent=1 AND "+q.sql()+" ORDER BY customer_id",q.args().toArray());
        String source=members.isEmpty()?"empty":s(members.get(0).get("source_version"));
        long id=insert(c,"INSERT INTO v3_segment_snapshot(segment_id,snapshot_name,customer_count,rule_snapshot,source_version) VALUES(?,?,?,?,?)",segmentId,seg.get("name"),members.size(),seg.get("rule_json"),source);
        try(PreparedStatement p=c.prepareStatement("INSERT INTO v3_segment_snapshot_member VALUES(?,?,?)")){for(Map<String,Object> m:members){bind(p,id,m.get("customer_id"),json(m));p.addBatch();}p.executeBatch();}return id;
    }
    public static LocalDateTime time(Object x){return LocalDateTime.parse(s(x).replace(" ","T"));}
    public Map<String,Object> validate(Connection c,Map<String,Object> raw)throws Exception{
        Map<String,Object> cfg=new LinkedHashMap<>(raw);
        require(OBJECTIVES.contains(s(cfg.get("objective"))),"仅支持客户唤醒、商户引流、积分消耗");
        require(!s(cfg.get("name")).isBlank()&&s(cfg.get("name")).length()<=160,"活动名称无效");
        one(c,"SELECT id FROM v3_segment WHERE id=?",cfg.get("segment_id"));
        Map<String,Object> benefit=one(c,"SELECT * FROM v3_benefit WHERE id=? FOR UPDATE",cfg.get("benefit_id"));
        require("ACTIVE".equals(benefit.get("status")),"权益已停用");require(s(benefit.get("scene_id")).equals(s(cfg.get("scene_id"))),"权益与场景不匹配");
        require(!"DRAW_REWARD".equals(benefit.get("type")),"DRAW_REWARD 使用已有营销玩法；P0 活动直发仅支持优惠券与积分兑换");
        if("POINTS_BURN".equals(cfg.get("objective")))require(n(benefit.get("points_price"))>0,"积分消耗活动必须使用积分兑换权益");
        require(cfg.get("merchant_ids") instanceof List && !((List<?>)cfg.get("merchant_ids")).isEmpty(),"请选择适用商户");
        List<Map<String,Object>> merchants=new ArrayList<>();
        for(Object mid:(List<?>)cfg.get("merchant_ids")){Map<String,Object> m=one(c,"SELECT * FROM v3_merchant WHERE id=? FOR UPDATE",mid);require("ACTIVE".equals(m.get("status"))&&s(m.get("scene_id")).equals(s(cfg.get("scene_id"))),"商户不可用或不属于该场景");merchants.add(m);}
        long budget=n(cfg.get("bank_budget_total"));require(budget>0&&budget<=1000000000L,"银行预算须为正数且不超过演示上限");
        require(TARGETS.contains(s(cfg.get("target_metric"))),"请选择预先定义的模拟目标行为");require(n(cfg.get("target_value"))>0,"目标客户数必须为正数");
        require(time(cfg.get("end_time")).isAfter(time(cfg.get("start_time"))),"结束时间必须晚于开始时间");
        Map<String,Object> guard=(Map<String,Object>)cfg.get("guardrail_config");require(guard!=null,"必须设置停止规则");
        require(guard.get("max_bank_budget")==null||n(guard.get("max_bank_budget"))>0,"硬预算上限不可超过活动预算");
        require(n(guard.get("max_cost_per_target_action"))>0,"目标行为成本阈值必须为正数");
        for(String key:List.of("min_redemption_rate","max_budget_burn_rate")){double v=Double.parseDouble(s(guard.get(key)));require(v>=0&&v<=1,"比率阈值必须在 0–1 之间");}
        cfg.put("benefit",benefit);cfg.put("merchants",merchants);cfg.put("scene",one(c,"SELECT * FROM v3_scene WHERE id=?",cfg.get("scene_id")));
        cfg.put("mock_data",true);cfg.put("claim_limit_per_customer",1);return cfg;
    }
    public long save(Connection c,Long id,Map<String,Object> body)throws Exception{
        Map<String,Object> cfg=validate(c,body);
        if(id==null)return insert(c,"INSERT INTO v3_campaign(name,config_json) VALUES(?,?)",cfg.get("name"),json(cfg));
        Map<String,Object> old=one(c,"SELECT * FROM v3_campaign WHERE id=? FOR UPDATE",id);
        require("DRAFT".equals(old.get("status")),"只有草稿可以编辑；发布版本不可修改");
        exec(c,"UPDATE v3_campaign SET name=?,config_json=? WHERE id=?",cfg.get("name"),json(cfg),id);return id;
    }
    private Map<String,Object> executionConfig(Connection c,Map<String,Object> raw)throws Exception{
        // Lock the referenced rule until the publication snapshot has been created.
        Map<String,Object> segment=one(c,"SELECT * FROM v3_segment WHERE id=? FOR UPDATE",raw.get("segment_id"));
        Map<String,Object> cfg=validate(c,raw);cfg.put("segment_rule_json",obj(segment.get("rule_json")));
        return V3ReviewConfig.payload(cfg);
    }
    public Map<String,Object> transition(Connection c,long id,String action)throws Exception{
        Map<String,Object> camp=one(c,"SELECT * FROM v3_campaign WHERE id=? FOR UPDATE",id);String status=s(camp.get("status"));
        String next;long vid=0;
        switch(action){
            case "submit":
                require(status.equals("DRAFT"),"仅草稿可提交");
                Map<String,Object> submitted=executionConfig(c,obj(camp.get("config_json")));
                exec(c,"UPDATE v3_campaign SET review_config_json=?,review_config_hash=?,review_submitted_at=NOW(),review_approved_at=NULL WHERE id=?",json(submitted),V3ReviewConfig.hash(submitted),id);
                next="PENDING_REVIEW";break;
            case "approve":
                require(status.equals("PENDING_REVIEW"),"仅待复核可通过");
                require(camp.get("review_config_json")!=null&&V3ReviewConfig.hash(obj(camp.get("review_config_json"))).equals(camp.get("review_config_hash")),"请重新提交复核快照");
                exec(c,"UPDATE v3_campaign SET review_approved_at=NOW() WHERE id=?",id);next="APPROVED";break;
            case "reject":require(status.equals("PENDING_REVIEW"),"仅待复核可退回");next="DRAFT";break;
            case "publish":
                require(status.equals("APPROVED"),"复核通过后才可发布");
                boolean matches=false;
                try { matches=camp.get("review_approved_at")!=null&&V3ReviewConfig.hash(executionConfig(c,obj(camp.get("config_json")))).equals(camp.get("review_config_hash")); }
                catch(IllegalArgumentException invalidConfig){ matches=false; }
                if(!matches){
                    exec(c,"UPDATE v3_campaign SET status='DRAFT',review_approved_at=NULL WHERE id=?",id);
                    // A result commits the invalidation; throwing inside Store.tx would roll it back.
                    return Map.of("error_code","REVIEW_CONTENT_CHANGED","message","复核通过后经营方案已发生变化，需要重新提交复核。","status","DRAFT");
                }
                Map<String,Object> cfg=obj(camp.get("review_config_json"));
                long sid=snapshot(c,n(cfg.get("segment_id")));cfg.put("segment_snapshot_id",sid);
                cfg.put("review_config_hash",camp.get("review_config_hash"));
                vid=insert(c,"INSERT INTO v3_campaign_version(campaign_id,segment_snapshot_id,config_json) VALUES(?,?,?)",id,sid,json(cfg));next="PUBLISHED";break;
            default:throw new IllegalArgumentException("未知状态操作");
        }
        exec(c,"UPDATE v3_campaign SET status=? WHERE id=?",next,id);return Map.of("status",next,"version_id",vid);
    }
    public long run(Connection c,long versionId)throws Exception{return run(c,versionId,null);}
    public long run(Connection c,long versionId,Long requested)throws Exception{
        Map<String,Object> v=one(c,"SELECT * FROM v3_campaign_version WHERE id=?",versionId),cfg=obj(v.get("config_json"));
        one(c,"SELECT * FROM v3_campaign WHERE id=? FOR UPDATE",v.get("campaign_id"));
        Object hard=((Map<?,?>)cfg.get("guardrail_config")).get("max_bank_budget");
        long cap=Math.min(n(cfg.get("bank_budget_total")),hard==null?Long.MAX_VALUE:n(hard));
        long total=requested==null?cap:requested;require(total>0,"申请分配预算必须为正数（分）");
        long allocated=n(one(c,"SELECT COALESCE(SUM(budget_total),0) amount FROM v3_campaign_run WHERE campaign_id=?",v.get("campaign_id")).get("amount"));
        // No Run cancellation/reallocation exists: every recorded allocation remains effective.
        require(total<=cap-allocated,"CAMPAIGN_BUDGET_CAP_EXCEEDED：活动级预算上限不足（分）：当前已分配 "+allocated+"，本次申请 "+total+"，活动上限 "+cap);
        long id=insert(c,"INSERT INTO v3_campaign_run(campaign_id,campaign_version_id,segment_snapshot_id,status,start_time,end_time,budget_total) VALUES(?,?,?,'RUNNING',?,?,?)",v.get("campaign_id"),versionId,v.get("segment_snapshot_id"),cfg.get("start_time"),cfg.get("end_time"),total);
        exec(c,"INSERT INTO v3_campaign_budget VALUES(?,?)",id,total);exec(c,"UPDATE v3_campaign SET status='RUNNING' WHERE id=?",v.get("campaign_id"));
        exec(c,"INSERT INTO v3_event_ledger(campaign_id,campaign_run_id,customer_id,segment_snapshot_id,event_type,scene_id,benefit_id,business_ref_id,idempotency_key,occurred_at,metadata_json) SELECT ?,?,customer_id,?,'ELIGIBLE',?,?,customer_id,CONCAT(? ,':ELIGIBLE:',customer_id),?,? FROM v3_segment_snapshot_member WHERE snapshot_id=?",v.get("campaign_id"),id,v.get("segment_snapshot_id"),cfg.get("scene_id"),cfg.get("benefit_id"),id,cfg.get("start_time"),json(Map.of("mock_data",true,"source","snapshot")),v.get("segment_snapshot_id"));return id;
    }
}
