package com.yuhui.operating;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class V3ReviewConfigTest {
 @Test void canonicalKeysAndNumbersAreStable(){
  Map<String,Object> a=new LinkedHashMap<>();a.put("budget",6000);a.put("rule",Map.of("b",2,"a",1));
  Map<String,Object> b=new LinkedHashMap<>();b.put("rule",Map.of("a",1L,"b",2L));b.put("budget",6000L);
  assertEquals(V3ReviewConfig.hash(a),V3ReviewConfig.hash(b));
 }
 @Test void volatileStockAndTimestampsAreExcluded(){
  assertEquals(V3ReviewConfig.hash(Map.of("benefit",Map.of("bank_cost",1200,"issued_stock",0))),V3ReviewConfig.hash(Map.of("benefit",Map.of("issued_stock",500,"bank_cost",1200,"updated_at","later"))));
 }
 @Test void executionChangesAffectHash(){
  assertNotEquals(V3ReviewConfig.hash(Map.of("segment_rule_json",Map.of("value",60))),V3ReviewConfig.hash(Map.of("segment_rule_json",Map.of("value",90))));
  assertNotEquals(V3ReviewConfig.hash(Map.of("target_value",150)),V3ReviewConfig.hash(Map.of("target_value",151)));
 }
 @Test void canonicalIntegerSurvivesJsonRoundTrip(){
  Map<String,Object> cfg=V3ReviewConfig.payload(Map.of("bank_budget_total",600000));
  Map<String,Object> reloaded=V3Store.obj(V3Store.json(cfg));
  assertEquals(600000,V3Store.n(reloaded.get("bank_budget_total")));
  assertEquals(V3ReviewConfig.hash(cfg),V3ReviewConfig.hash(reloaded));
 }
 @Test void uiFieldsCannotEnterReviewedPayload(){
  assertEquals(V3ReviewConfig.payload(Map.of("target_value",150)),V3ReviewConfig.payload(Map.of("target_value",150,"ui_state","open","segment_snapshot_id",123)));
 }
}
