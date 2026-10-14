package com.yuhui.marketing;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.redisson.codec.JsonJacksonCodec;
import com.yuhui.infrastructure.redis.LegacyCacheTypes;
import com.yuhui.marketing.reward.behavior.model.entity.BehaviorEntity;
class CacheMigrationTest {
 @Test void historicalTypeMetadataReadsWithoutCacheReset() throws Exception {
  var codec=new JsonJacksonCodec();codec.getObjectMapper().setTypeFactory(new LegacyCacheTypes());
  codec=new JsonJacksonCodec(getClass().getClassLoader(),codec);
  var input=new BehaviorEntity();input.setUserId("u");input.setActivityId(9L);
  var old=codec.getObjectMapper().writeValueAsString(input).replace("com.yuhui.marketing.reward.behavior", "com.lottery.domain.rebate");
  var value=(BehaviorEntity)codec.getObjectMapper().readValue(old,Object.class);
  assertEquals("u",value.getUserId());assertEquals(9L,value.getActivityId());
  assertTrue(codec.getObjectMapper().writeValueAsString(value).contains("com.yuhui.marketing.reward.behavior"));
 }
}
