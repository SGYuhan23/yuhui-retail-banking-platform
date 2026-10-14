package com.yuhui.interceptor;
import com.yuhui.types.util.ThreadUtils;
import com.yuhui.types.util.UserUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/** Fixed identity for the loopback-only local replica; never authenticates remote deployments. */
@Component
public class UserInterceptor implements HandlerInterceptor {
    @Value("${replica.local-mode:false}") private boolean localMode;
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!localMode || !("127.0.0.1".equals(request.getRemoteAddr()) || "0:0:0:0:0:0:0:1".equals(request.getRemoteAddr()) || "::1".equals(request.getRemoteAddr()))) {
            response.sendError(403, "Local replica requires loopback access and the local profile");
            return false;
        }
        UserUtils user = new UserUtils();
        user.setId(10002L); user.setUsername("渝惠体验客户"); user.setTenantId(1L);
        user.setRoles(List.of("ROLE_ADMIN")); user.setPermissions(List.of());
        ThreadUtils.setUser(user);
        return true;
    }
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        ThreadUtils.removeUser();
    }
}
