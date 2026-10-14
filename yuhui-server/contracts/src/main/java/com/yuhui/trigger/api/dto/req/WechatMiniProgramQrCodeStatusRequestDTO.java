package com.yuhui.trigger.api.dto.req;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serial;
import java.io.Serializable;

@Data
public class WechatMiniProgramQrCodeStatusRequestDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "qrcodeId cannot be blank")
    private String qrcodeId;
}
