package com.yuhui.infrastructure.redis;
import com.fasterxml.jackson.databind.type.TypeFactory;
import java.util.Map;
/** Read compatibility for persisted JSON type IDs; new writes use current packages. */
public class LegacyCacheTypes extends TypeFactory {
    public LegacyCacheTypes() { super(new com.fasterxml.jackson.databind.util.LRUMap<>(16, 200)); }
    private LegacyCacheTypes(ClassLoader loader) {
        super(new com.fasterxml.jackson.databind.util.LRUMap<>(16, 200), new com.fasterxml.jackson.databind.type.TypeParser(TypeFactory.defaultInstance()), null, loader);
    }
    @Override public TypeFactory withClassLoader(ClassLoader loader) {
        return new LegacyCacheTypes(loader);
    }
    private static final Map<String,String> DOMAINS = Map.of(
        "credit", "marketing.points", "strategy", "marketing.raffle",
        "rebate", "marketing.reward.behavior", "award", "marketing.reward.fulfillment",
        "activity", "marketing.participation", "task", "marketing.task",
        "channel", "marketing.channel", "user", "identity");
    @Override public Class<?> findClass(String name) throws ClassNotFoundException {
        for (var entry : DOMAINS.entrySet()) {
            String prefix = "com.lottery.domain." + entry.getKey() + ".";
            if (name.startsWith(prefix)) return super.findClass("com.yuhui." + entry.getValue() + "." + name.substring(prefix.length()));
        }
        if (name.startsWith("com.lottery.")) name = "com.yuhui." + name.substring("com.lottery.".length());
        return super.findClass(name);
    }
}
