package com.yuhui.identity.service.impl;

import com.yuhui.identity.model.vo.UserVO;
import com.yuhui.identity.model.vo.WechatMiniProgramQrCodeVO;

public interface IUserService {
    void sendEmailRegisterCode(String email);

    UserVO registerByEmail(String email, String passCode, String password);

    UserVO loginByEmailPassword(String email, String password);

    UserVO refreshToken(String refreshToken);

    WechatMiniProgramQrCodeVO generateWechatMiniProgramLoginQrCode();

    WechatMiniProgramQrCodeVO queryWechatMiniProgramLoginQrCodeStatus(String qrcodeId);

    UserVO loginByWechatMiniProgramQrCode(String ticket);

    void logout(Long userId);
}
