package com.yuhui.identity.model.vo;


import lombok.Data;

import java.util.Date;

@Data
public class UserVO {
    private Long id;

    /**
     * 用户名
     */
    private String username;


    /**
     * 状态 0-正常 1-禁用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    private String token;

    private String refreshToken;

    private Long expiresIn;

}
