package com.yuhui.identity.repository;

import com.yuhui.identity.model.vo.UserVO;
import com.yuhui.identity.model.vo.WechatMiniProgramQrCodeVO;

public interface IUserRepository {
    void sendEmailRegisterCode(String email);

    UserVO registerByEmail(String email, String passCode, String password);

    UserVO loginByEmailPassword(String email, String password);

    UserVO refreshToken(String refreshToken);

    WechatMiniProgramQrCodeVO generateWechatMiniProgramLoginQrCode();

    WechatMiniProgramQrCodeVO queryWechatMiniProgramLoginQrCodeStatus(String qrcodeId);

    UserVO loginByWechatMiniProgramQrCode(String ticket);

    void logout(Long userId);
}
