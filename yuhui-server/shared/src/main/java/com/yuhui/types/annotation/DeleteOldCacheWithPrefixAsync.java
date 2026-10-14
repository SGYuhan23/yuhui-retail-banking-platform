package com.yuhui.types.annotation;

import java.lang.annotation.*;

/**

 * 删除以特定前缀开头的旧缓存注解
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Documented
public @interface DeleteOldCacheWithPrefixAsync {
    /**
     * 要删除的缓存key
     */
    String[] key();

}
