package com.yuhui.aop;

import com.yuhui.infrastructure.redis.RedisService;
import com.yuhui.types.annotation.DeleteOldCacheWithPrefixSync;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.LocalVariableTableParameterNameDiscoverer;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.lang.reflect.Method;

/**

 * 操作前删除以前缀开头的旧缓存
 */
@Aspect
@Slf4j
@Component
public class DeleteOldCacheWithPrefixSyncAOP {
    @Resource
    private RedisService redisService;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final LocalVariableTableParameterNameDiscoverer paramNameDiscoverer = new LocalVariableTableParameterNameDiscoverer();

    /**
     * 使用前置通知，在方法执行前执行
     */
    @Before("@annotation(com.yuhui.types.annotation.DeleteOldCacheWithPrefixSync)&&@annotation(deleteOldCacheWithPrefixSync)")
    public void after(JoinPoint joinPoint, DeleteOldCacheWithPrefixSync deleteOldCacheWithPrefixSync) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Object[] args = joinPoint.getArgs();

        // 获取参数名
        String[] paramNames = paramNameDiscoverer.getParameterNames(method);

        // 构建上下文
        StandardEvaluationContext context = new StandardEvaluationContext();
        if (paramNames != null && args != null) {
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }
        }

        // 获取 keyParam 表达式并求值
        String keyParamExpression = deleteOldCacheWithPrefixSync.keyParam();
        String resolvedKeyParam = null;
        if (!keyParamExpression.isEmpty()) {
            resolvedKeyParam = parser.parseExpression(keyParamExpression).getValue(context, String.class);
        }

        // 删除缓存
        for (String baseKey : deleteOldCacheWithPrefixSync.key()) {
            String finalKey = resolvedKeyParam != null ? baseKey + resolvedKeyParam : baseKey;
            redisService.deleteKeysWithPrefix(finalKey);
        }
    }
}
