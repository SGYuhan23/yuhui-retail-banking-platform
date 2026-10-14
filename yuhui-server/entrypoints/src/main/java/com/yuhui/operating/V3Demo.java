package com.yuhui.operating;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;
import java.sql.*;
import java.time.*;
import java.util.*;
import static com.yuhui.operating.V3Store.*;
@Service @Profile("local")
public class V3Demo {
    private final V3Campaigns campaigns;private final V3Execution execution;private final V3Review review;
    public V3Demo(V3Campaigns a,V3Execution e,V3Review r){campaigns=a;execution=e;review=r;}
    static Map<String,Object> condition(String f,String op,Object v){return Map.of("field",f,"op",op,"value",v);}
    public Map<String,Object> reset(Connection c,long seed)throws Exception{
        exec(c,"SET @v3_reset=1");
        // v3-only explicit administrative reset. Original ledgers are never touched.
        for(String table:List.of("decision_record","event_ledger","budget_ledger","entitlement","campaign_budget","campaign_run","campaign_version","campaign","segment_snapshot_member","segment_snapshot","segment","benefit","merchant","scene","customer"))exec(c,"DELETE FROM v3_"+table);
        exec(c,"SET @v3_reset=0");
        String[] scenes={"COMMUNITY","DINING","CULTURE_TOURISM","LOCAL_SPECIALTY"},names={"社区生活","餐饮消费","山城文旅","乡村 / 重庆特色消费"};
        for(int i=0;i<4;i++)exec(c,"INSERT INTO v3_scene VALUES(?,?)",scenes[i],names[i]);
        Random random=new Random(seed);LocalDateTime base=LocalDateTime.of(2026,10,1,10,0);
        try(PreparedStatement p=c.prepareStatement("INSERT INTO v3_customer VALUES(?,1,?,?,?,?,?,?,?,?,?,?,?, ?,?)")){
            for(int i=1;i<=30000;i++){
                int days=random.nextInt(200),points=500+random.nextInt(10000);String scene=scenes[random.nextInt(4)],district=random.nextInt(100)<65?"涪陵":"重庆其他演示地区";
                bind(p,String.format("SYN%05d",i),district,"A"+(1+random.nextInt(4)),days<7?"NEW":days<30?"ACTIVE":days<60?"AT_RISK":"DORMANT",base.minusDays(days),days,days<30?1+random.nextInt(15):0,points,random.nextInt(points+1),scene,random.nextBoolean()?"COUPON":"POINTS_EXCHANGE",random.nextInt(100)<85,base.minusYears(1),"seed-"+seed+"-20261001");p.addBatch();if(i%1000==0)p.executeBatch();
            }
        }
        List<Long> community=new ArrayList<>();String[] mn={"渝邻便利（虚构）","山城早餐铺（虚构）","邻里生鲜（虚构）","江畔小铺（虚构）","桥头生活社（虚构）","山城茶馆（虚构）","邻里杂货（虚构）","江岸便民店（虚构）","山城小餐桌（虚构）","云岭漫游（虚构）","乡里优选（虚构）","江畔咖啡（虚构）"};
        for(int i=0;i<12;i++){String scene=i<8?scenes[0]:scenes[1+(i-8)%3];long mid=insert(c,"INSERT INTO v3_merchant(name,district,scene_id,category) VALUES(?,'涪陵',?,'合成生活商户')",mn[i],scene);if(i<8)community.add(mid);}
        long coupon=insert(c,"INSERT INTO v3_benefit(name,scene_id,type,face_value,minimum_spend,bank_cost,merchant_cost,points_price,valid_days,total_stock) VALUES('20元社区生活权益','COMMUNITY','COUPON',2000,4000,1200,800,0,7,10000)");
        insert(c,"INSERT INTO v3_benefit(name,scene_id,type,face_value,minimum_spend,bank_cost,merchant_cost,points_price,valid_days,total_stock) VALUES('500积分兑社区生活券','COMMUNITY','POINTS_EXCHANGE',1000,2000,600,400,500,7,10000)");
        insert(c,"INSERT INTO v3_benefit(name,scene_id,type,face_value,minimum_spend,bank_cost,merchant_cost,points_price,valid_days,total_stock) VALUES('抽奖权益（已有玩法）','CULTURE_TOURISM','DRAW_REWARD',1000,2000,600,400,0,7,10000)");
        List<Map<String,Object>> conditions=List.of(condition("district","=","涪陵"),condition("last_active_days",">=",60),condition("last_active_days","<=",180),condition("points_balance",">=",2000),condition("preferred_scene","=","COMMUNITY"),condition("marketing_consent","=",true));
        long seg=campaigns.segment(c,null,Map.of("name","沉默高积分客户","rule",Map.of("logic","AND","conditions",conditions)));
        campaigns.segment(c,null,Map.of("name","社区生活活跃客户","rule",Map.of("logic","AND","conditions",List.of(condition("preferred_scene","=","COMMUNITY"),condition("lifecycle_stage","=","ACTIVE")))));
        campaigns.segment(c,null,Map.of("name","积分即将到期客户","rule",Map.of("logic","AND","conditions",List.of(condition("expiring_points",">=",1000)))));
        campaigns.segment(c,null,Map.of("name","文旅偏好客户","rule",Map.of("logic","AND","conditions",List.of(condition("preferred_scene","=","CULTURE_TOURISM")))));
        Map<String,Object> cfg=new LinkedHashMap<>();cfg.put("name","涪陵社区生活场景｜沉默客户唤醒计划");cfg.put("objective","CUSTOMER_REACTIVATION");cfg.put("segment_id",seg);cfg.put("scene_id","COMMUNITY");cfg.put("benefit_id",coupon);cfg.put("merchant_ids",community);cfg.put("bank_budget_total",600000);cfg.put("target_metric","MOCK_COMMUNITY_PURCHASE");cfg.put("target_value",150);cfg.put("start_time","2026-10-01 00:00:00");cfg.put("end_time","2026-10-12 23:59:59");cfg.put("guardrail_config",Map.of("max_bank_budget",600000,"max_cost_per_target_action",2400,"min_redemption_rate",0.3,"max_budget_burn_rate",0.9));
        long cid=campaigns.save(c,null,cfg);campaigns.transition(c,cid,"submit");campaigns.transition(c,cid,"approve");long vid=n(campaigns.transition(c,cid,"publish").get("version_id"));long run=campaigns.run(c,vid);
        Map<String,Object> r=execution.run(c,run);List<Map<String,Object>> members=rows(c,"SELECT customer_id FROM v3_segment_snapshot_member WHERE snapshot_id=? ORDER BY customer_id",r.get("segment_snapshot_id"));int claims=0;
        for(int i=0;i<members.size();i++){
            String user=s(members.get(i).get("customer_id"));if(random.nextDouble()>0.72)continue;
            execution.record(c,run,user,"DELIVERED","",base);if(random.nextDouble()>0.62)continue;
            execution.record(c,run,user,"PARTICIPATED","",base.plusMinutes(1));if(claims>=500||random.nextDouble()>0.70)continue;
            long merchant=community.get(random.nextInt(community.size()));Map<String,Object> e=execution.claim(c,run,user,merchant,base.plusMinutes(2));claims++;
            double rate=community.indexOf(merchant)==0?0.12:0.64;
            if(random.nextDouble()<rate){execution.redeem(c,s(e.get("code")),merchant,4000,base.plusDays(1));if(random.nextDouble()<0.8)execution.record(c,run,user,"TARGET_ACTION_COMPLETED","MOCK_COMMUNITY_PURCHASE",base.plusDays(2));}
        }
        execution.expire(c,base.plusDays(11));execution.end(c,run);
        Map<String,Object> result=new LinkedHashMap<>();result.put("seed",seed);result.put("customers",30000);result.put("run_id",run);result.put("review",review.review(c,run));return result;
    }
}
