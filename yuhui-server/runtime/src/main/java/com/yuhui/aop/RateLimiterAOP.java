package com.yuhui.aop;

import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.annotation.DCCValue;
import com.yuhui.types.annotation.RateLimiterAccessInterceptor;
import com.yuhui.types.common.Constants;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

/**

 * 访问频次限制
 */
@Slf4j
@Aspect
@Component
public class RateLimiterAOP {

    @DCCValue("rateLimiterSwitch:open")
    private String rateLimiterSwitch;

    @Resource
    private RedisService redisService;


    @Pointcut("@annotation(com.yuhui.types.annotation.RateLimiterAccessInterceptor)")
    public void aopPoint() {
    }

    @Around("aopPoint()&&@annotation(rateLimiterAccessInterceptor)")
    public Object doRouter(ProceedingJoinPoint pj, RateLimiterAccessInterceptor rateLimiterAccessInterceptor) throws Throwable {
        // 判断限流开关是否开启，未开启直接放行
        if (StringUtils.isBlank(rateLimiterSwitch) || "close".equals(rateLimiterSwitch)) {
            return pj.proceed();
        }
        String key = rateLimiterAccessInterceptor.key();
        if (StringUtils.isBlank(key)) {
            throw new RuntimeException("@RateLimiterAccessInterceptor key is null");
        }
        // 获取字段
        String keyAttr = getAttrValue(key, pj.getArgs());
        log.info("aop attr {}", keyAttr);

        // 黑名单判断
        if (rateLimiterAccessInterceptor.blacklistCount() != 0 && checkAndIncrementBlacklist(keyAttr, rateLimiterAccessInterceptor.blacklistCount())) {
            log.info("限流-黑名单拦截(24h)：{}", keyAttr);
            return fallbackMethodResult(pj, rateLimiterAccessInterceptor.fallbackMethod());
        }

        // 获取分布式限流器
        RRateLimiter rateLimiter = getDistributedRateLimiter(keyAttr, rateLimiterAccessInterceptor.permitsPerSecond());

        // 尝试获取令牌
        if (!rateLimiter.tryAcquire()) {
            if (rateLimiterAccessInterceptor.blacklistCount() != 0) {
                String redisKey = Constants.RedisKey.BLACKLIST + keyAttr;
                RAtomicLong counter = redisService.getAtomicLong(redisKey);
                long current = counter.incrementAndGet();
                if (current==1) {
                    // 如果是第一次设置，则添加过期时间
                    counter.expire(24, TimeUnit.HOURS);
                }
            }
            log.info("限流-超频次拦截：{}", keyAttr);
            return fallbackMethodResult(pj, rateLimiterAccessInterceptor.fallbackMethod());
        }

        return pj.proceed();
    }

    private boolean checkAndIncrementBlacklist(String key, long maxCount) {
        String redisKey = Constants.RedisKey.BLACKLIST + key;
        RAtomicLong counter = redisService.getAtomicLong(redisKey);
        long current = Long.parseLong(String.valueOf(counter));
        return current >= maxCount;
    }

    private RRateLimiter getDistributedRateLimiter(String key, long permitsPerSecond) {
        String redisKey = Constants.RedisKey.RATE_LIMITER + key;
        RRateLimiter rateLimiter = redisService.getRateLimiter(redisKey);
        if (!rateLimiter.isExists()) {
            rateLimiter.trySetRate(RateType.OVERALL, permitsPerSecond, 1, RateIntervalUnit.SECONDS);
        }
        return rateLimiter;
    }

    /**
     * 调用用户配置的回调方法，当拦截后，返回回调结果。
     */
    private Object fallbackMethodResult(JoinPoint jp, String fallbackMethod) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Signature sig = jp.getSignature();
        MethodSignature methodSignature = (MethodSignature) sig;
        Method method = jp.getTarget().getClass().getMethod(fallbackMethod, methodSignature.getParameterTypes());
        return method.invoke(jp.getThis(), jp.getArgs());
    }


    /**
     * 返回第一个满足条件的属性值
     */
    public String getAttrValue(String attr, Object[] args) {
        if (args[0] instanceof String) {
            return args[0].toString();
        }
        String filedValue = null;
        for (Object arg : args) {
            try {
                if (StringUtils.isNotBlank(filedValue)) {
                    break;
                }
                filedValue = String.valueOf(this.getValueByName(arg, attr));
            } catch (Exception e) {
                log.error("获取路由属性值失败 attr：{}", attr, e);
            }
        }
        return filedValue;
    }

    /**
     * 获取对象的特定属性值
     *
     * @param item 对象
     * @param name 属性名
     * @return 属性值

     */
    private Object getValueByName(Object item, String name) {
        try {
            Field field = getFieldByName(item, name);
            if (field == null) {
                return null;
            }
            field.setAccessible(true);
            Object o = field.get(item);
            field.setAccessible(false);
            return o;
        } catch (IllegalAccessException e) {
            return null;
        }
    }

    /**
     * 根据名称获取方法，该方法同时兼顾继承类获取父类的属性
     *
     * @param item 对象
     * @param name 属性名
     * @return 该属性对应方法

     */
    private Field getFieldByName(Object item, String name) {
        try {
            Field field;
            try {
                field = item.getClass().getDeclaredField(name);
            } catch (NoSuchFieldException e) {
                field = item.getClass().getSuperclass().getDeclaredField(name);
            }
            return field;
        } catch (NoSuchFieldException e) {
            return null;
        }
    }


}
