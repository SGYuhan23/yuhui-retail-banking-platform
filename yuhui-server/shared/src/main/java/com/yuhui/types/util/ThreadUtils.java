package com.yuhui.types.util;

public class ThreadUtils {

    static ThreadLocal<UserUtils> userThreadLocal = new ThreadLocal<>();

    public static UserUtils getUser() {
        return userThreadLocal.get();
    }

    public static void setUser(UserUtils userUtils) {
        userThreadLocal.set(userUtils);
    }

    public static void removeUser() {
        userThreadLocal.remove();
    }
}
