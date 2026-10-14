package com.yuhui.trigger.api.dto.req;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import javax.validation.constraints.NotBlank;

@Data
public class RefreshTokenRequestDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "refreshToken不能为空")
    private String refreshToken;
}
