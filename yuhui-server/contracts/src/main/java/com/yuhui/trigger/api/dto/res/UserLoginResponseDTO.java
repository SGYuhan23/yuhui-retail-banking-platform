package com.yuhui.trigger.api.dto.res;


import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class UserLoginResponseDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * accessToken
     */
    private String accessToken;

    /**
     * refreshToken
     */
    private String refreshToken;

    /**
     * 过期时间（秒）
     */
    private Long expiresIn;


}
