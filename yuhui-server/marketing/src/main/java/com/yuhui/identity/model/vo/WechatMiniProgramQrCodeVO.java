package com.yuhui.identity.model.vo;

import lombok.Data;

@Data
public class WechatMiniProgramQrCodeVO {
    private String qrcodeId;
    private String qrCodeUrl;
    private String customLogoUrl;
    private String status;
    private String ticket;
    private String displayName;
    private String photo;
}
