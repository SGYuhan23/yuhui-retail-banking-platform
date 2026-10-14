package com.yuhui.types.util;

import lombok.Data;

import java.util.List;

@Data
public class UserUtils {
    private Long id;
    private String username;
    private List<String> roles;
    private List<String> permissions;
    private Long tenantId;

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
}
