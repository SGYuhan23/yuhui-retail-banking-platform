package com.yuhui.identity.service.impl;

import com.yuhui.identity.model.vo.UserVO;
import com.yuhui.identity.model.vo.WechatMiniProgramQrCodeVO;
import com.yuhui.identity.repository.IUserRepository;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.exception.AppException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

@Service
public class IUserServiceImpl implements IUserService {

    @Resource
    private IUserRepository repository;

    @Override
    public void sendEmailRegisterCode(String email) {
        if (StringUtils.isBlank(email)) {
            throw new AppException(ResponseCode.EMAIL_EMPTY.getCode(), ResponseCode.EMAIL_EMPTY.getMessage());
        }
        repository.sendEmailRegisterCode(email.trim().toLowerCase());
    }

    @Override
    public UserVO registerByEmail(String email, String passCode, String password) {
        if (StringUtils.isBlank(email)) {
            throw new AppException(ResponseCode.EMAIL_EMPTY.getCode(), ResponseCode.EMAIL_EMPTY.getMessage());
        }
        if (StringUtils.isBlank(passCode)) {
            throw new AppException(ResponseCode.EMAIL_PASSCODE_EMPTY.getCode(), ResponseCode.EMAIL_PASSCODE_EMPTY.getMessage());
        }
        if (StringUtils.isBlank(password)) {
            throw new AppException(ResponseCode.EMAIL_PASSWORD_EMPTY.getCode(), ResponseCode.EMAIL_PASSWORD_EMPTY.getMessage());
        }
        return repository.registerByEmail(email.trim().toLowerCase(), passCode.trim(), password);
    }

    @Override
    public UserVO loginByEmailPassword(String email, String password) {
        if (StringUtils.isBlank(email)) {
            throw new AppException(ResponseCode.EMAIL_EMPTY.getCode(), ResponseCode.EMAIL_EMPTY.getMessage());
        }
        if (StringUtils.isBlank(password)) {
            throw new AppException(ResponseCode.EMAIL_PASSWORD_EMPTY.getCode(), ResponseCode.EMAIL_PASSWORD_EMPTY.getMessage());
        }
        return repository.loginByEmailPassword(email.trim().toLowerCase(), password);
    }

    @Override
    public UserVO refreshToken(String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ResponseCode.REFRESH_TOKEN_INVALID.getCode(), ResponseCode.REFRESH_TOKEN_INVALID.getMessage());
        }
        return repository.refreshToken(refreshToken);
    }

    @Override
    public WechatMiniProgramQrCodeVO generateWechatMiniProgramLoginQrCode() {
        return repository.generateWechatMiniProgramLoginQrCode();
    }

    @Override
    public WechatMiniProgramQrCodeVO queryWechatMiniProgramLoginQrCodeStatus(String qrcodeId) {
        if (StringUtils.isBlank(qrcodeId)) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), "qrcodeId cannot be blank");
        }
        return repository.queryWechatMiniProgramLoginQrCodeStatus(qrcodeId.trim());
    }

    @Override
    public UserVO loginByWechatMiniProgramQrCode(String ticket) {
        if (StringUtils.isBlank(ticket)) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), "ticket cannot be blank");
        }
        return repository.loginByWechatMiniProgramQrCode(ticket.trim());
    }

    @Override
    public void logout(Long userId) {
        repository.logout(userId);
    }
}
