package com.yuhui.operating;
import java.util.*;
import static com.yuhui.operating.V3Store.*;
/** Small parameterized AND/OR predicate, deliberately not an extensible rule engine. */
public final class V3Rules {
    public record Query(String sql,List<Object> args) {}
    private static final Set<String> FIELDS=Set.of("district","asset_tier","lifecycle_stage","last_active_days","activity_level_30d","points_balance","expiring_points","preferred_scene","preferred_benefit_type","marketing_consent");
    public static Query compile(Map<String,Object> rule){
        String logic=s(rule.get("logic"));require(Set.of("AND","OR").contains(logic),"规则仅支持 AND / OR");
        Object raw=rule.get("conditions");require(raw instanceof List,"缺少条件");List<?> conditions=(List<?>)raw;
        require(!conditions.isEmpty()&&conditions.size()<=12,"条件数量需为 1–12");List<String> clauses=new ArrayList<>();List<Object> args=new ArrayList<>();
        for(Object x:conditions){require(x instanceof Map,"条件无效");Map<?,?> m=(Map<?,?>)x;String f=s(m.get("field")),op=s(m.get("op"));require(FIELDS.contains(f),"未知客群字段");require(Set.of("=",">=","<=",">","<","!=").contains(op),"不支持的比较符");Object value=m.get("value");require(value!=null&&!(value instanceof Map)&&!(value instanceof List),"条件值无效");clauses.add(f+" "+op+" ?");args.add(value);}
        return new Query("("+String.join(" "+logic+" ",clauses)+")",args);
    }
}
