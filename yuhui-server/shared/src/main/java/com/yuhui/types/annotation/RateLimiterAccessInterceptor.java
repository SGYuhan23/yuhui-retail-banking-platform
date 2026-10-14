package com.yuhui.types.annotation;

import java.lang.annotation.*;

/**

 * 限流注解
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Documented
public @interface RateLimiterAccessInterceptor {
    /**
     * 用哪个字段作为拦截标识
     */
    String key();

    /**
     * 限制频次（每秒请求次数，每超过该值则异常次数+1）
     */
    long permitsPerSecond();

    /**
     * 黑名单拦截（多少次限制后（上面的异常次数）加入黑名单）0 不限制
     */
    long blacklistCount() default 0;

    /**
     * 拦截后的执行方法
     */
    String fallbackMethod();

}
