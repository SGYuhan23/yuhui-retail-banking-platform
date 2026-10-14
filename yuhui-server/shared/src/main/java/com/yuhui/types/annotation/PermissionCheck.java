package com.yuhui.types.annotation;

import java.lang.annotation.*;

/**

 * 权限校验
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Documented
public @interface PermissionCheck {
    String[] roles();
}
