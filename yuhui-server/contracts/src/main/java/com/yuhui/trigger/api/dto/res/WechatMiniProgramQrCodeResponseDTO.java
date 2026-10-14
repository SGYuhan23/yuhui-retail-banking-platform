package com.yuhui.trigger.api.dto.res;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class WechatMiniProgramQrCodeResponseDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String qrcodeId;
    private String qrCodeUrl;
    private String customLogoUrl;
    private String status;
    private String ticket;
    private String displayName;
    private String photo;
}
