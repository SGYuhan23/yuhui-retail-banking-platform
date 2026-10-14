package com.yuhui.operating;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.*;
class V3RulesTest {
 @Test void valuesAreBoundNotInterpolated(){var q=V3Rules.compile(Map.of("logic","OR","conditions",List.of(Map.of("field","district","op","=","value","x' OR 1=1 --"))));assertEquals("(district = ?)",q.sql());assertEquals("x' OR 1=1 --",q.args().get(0));}
 @Test void unknownFieldRejected(){assertThrows(IllegalArgumentException.class,()->V3Rules.compile(Map.of("logic","AND","conditions",List.of(Map.of("field","customer_id; DROP TABLE x","op","=","value",1)))));}
 @Test void invalidOperatorRejected(){assertThrows(IllegalArgumentException.class,()->V3Rules.compile(Map.of("logic","AND","conditions",List.of(Map.of("field","points_balance","op","LIKE","value",1)))));}
 @Test void emptyRuleRejected(){assertThrows(IllegalArgumentException.class,()->V3Rules.compile(Map.of("logic","AND","conditions",List.of())));}
 @Test void unknownLogicRejected(){assertThrows(IllegalArgumentException.class,()->V3Rules.compile(Map.of("logic","XOR","conditions",List.of())));}
}
