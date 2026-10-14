package com.yuhui.config;


import com.yuhui.interceptor.UserInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import javax.annotation.Resource;

/**

 * 注册拦截器
 */
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    @Resource
    private UserInterceptor userInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/user/email/send-code")
                .excludePathPatterns("/user/email/register")
                .excludePathPatterns("/user/email/login")
                .excludePathPatterns("/user/refresh")
                .excludePathPatterns("/user/wechat-mini-program/qrcode/generate")
                .excludePathPatterns("/user/wechat-mini-program/qrcode/status")
                .excludePathPatterns("/user/wechat-mini-program/qrcode/login")
                .excludePathPatterns("/health/check");
    }
}
