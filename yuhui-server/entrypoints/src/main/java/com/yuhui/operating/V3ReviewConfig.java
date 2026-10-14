package com.yuhui.operating;

import java.util.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import static com.yuhui.operating.V3Store.*;

/** Only execution fields participate; volatile stock and database timestamps do not. */
public final class V3ReviewConfig {
    private V3ReviewConfig() {}
    public static Map<String,Object> payload(Map<String,Object> cfg){
        Map<String,Object> out=new TreeMap<>();
        for(String k:List.of("name","objective","segment_id","segment_rule_json","scene_id","benefit_id","merchant_ids","bank_budget_total","target_metric","target_value","guardrail_config","start_time","end_time","benefit","merchants","scene","mock_data","claim_limit_per_customer"))out.put(k,canonical(cfg.get(k)));
        return out;
    }
    static Object canonical(Object value){
        if(value instanceof Map){Map<String,Object> out=new TreeMap<>();((Map<?,?>)value).forEach((k,v)->{if(!Set.of("created_at","updated_at","issued_stock").contains(s(k)))out.put(s(k),canonical(v));});return out;}
        if(value instanceof List){List<Object> out=new ArrayList<>();for(Object x:(List<?>)value)out.add(canonical(x));return out;}
        if(value instanceof Number){BigDecimal number=new BigDecimal(value.toString()).stripTrailingZeros();return number.scale()<=0?number.toBigIntegerExact():number;}
        return value;
    }
    public static String hash(Map<String,Object> cfg){
        try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json(canonical(cfg)).getBytes(StandardCharsets.UTF_8)));}
        catch(Exception e){throw new IllegalStateException("Unable to fingerprint review configuration",e);}
    }
}
