package com.yuhui.trigger.http;

import com.yuhui.identity.model.vo.UserVO;
import com.yuhui.identity.model.vo.WechatMiniProgramQrCodeVO;
import com.yuhui.identity.service.impl.IUserService;
import com.yuhui.trigger.api.dto.req.EmailPasswordLoginRequestDTO;
import com.yuhui.trigger.api.dto.req.EmailRegisterRequestDTO;
import com.yuhui.trigger.api.dto.req.RefreshTokenRequestDTO;
import com.yuhui.trigger.api.dto.req.SendEmailRegisterCodeRequestDTO;
import com.yuhui.trigger.api.dto.req.WechatMiniProgramQrCodeLoginRequestDTO;
import com.yuhui.trigger.api.dto.req.WechatMiniProgramQrCodeStatusRequestDTO;
import com.yuhui.trigger.api.dto.res.UserLoginResponseDTO;
import com.yuhui.trigger.api.dto.res.WechatMiniProgramQrCodeResponseDTO;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.model.BaseResponse;
import com.yuhui.types.util.ThreadUtils;
import com.yuhui.types.util.UserUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.validation.Valid;

@RestController
@RequestMapping("/user")
@CrossOrigin("*")
@Slf4j
public class UserController {

    @Resource
    private IUserService userService;

    @PostMapping("/refresh")
    public BaseResponse<UserLoginResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        log.info("[UserController-refresh] refresh token request received");

        UserVO userVO = userService.refreshToken(request.getRefreshToken());

        UserLoginResponseDTO responseDTO = new UserLoginResponseDTO();
        responseDTO.setId(userVO.getId());
        responseDTO.setUsername(userVO.getUsername());
        responseDTO.setAccessToken(userVO.getToken());
        responseDTO.setRefreshToken(userVO.getRefreshToken());
        responseDTO.setExpiresIn(userVO.getExpiresIn());

        log.info("[UserController-refresh] refresh token succeeded, userId={}", responseDTO.getId());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), responseDTO);
    }

    @PostMapping("/email/send-code")
    public BaseResponse<Void> sendEmailRegisterCode(@Valid @RequestBody SendEmailRegisterCodeRequestDTO request) {
        log.info("[UserController-sendEmailRegisterCode] request received, email={}", request.getEmail());
        userService.sendEmailRegisterCode(request.getEmail());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    @PostMapping("/email/register")
    public BaseResponse<UserLoginResponseDTO> registerByEmail(@Valid @RequestBody EmailRegisterRequestDTO request) {
        log.info("[UserController-registerByEmail] request received, email={}", request.getEmail());

        UserVO userVO = userService.registerByEmail(request.getEmail(), request.getPassCode(), request.getPassword());
        UserLoginResponseDTO responseDTO = new UserLoginResponseDTO();
        responseDTO.setId(userVO.getId());
        responseDTO.setUsername(userVO.getUsername());
        responseDTO.setAccessToken(userVO.getToken());
        responseDTO.setRefreshToken(userVO.getRefreshToken());
        responseDTO.setExpiresIn(userVO.getExpiresIn());

        log.info("[UserController-registerByEmail] register succeeded, userId={}", responseDTO.getId());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), responseDTO);
    }

    @PostMapping("/email/login")
    public BaseResponse<UserLoginResponseDTO> loginByEmailPassword(@Valid @RequestBody EmailPasswordLoginRequestDTO request) {
        log.info("[UserController-loginByEmailPassword] request received, email={}", request.getEmail());

        UserVO userVO = userService.loginByEmailPassword(request.getEmail(), request.getPassword());
        UserLoginResponseDTO responseDTO = new UserLoginResponseDTO();
        responseDTO.setId(userVO.getId());
        responseDTO.setUsername(userVO.getUsername());
        responseDTO.setAccessToken(userVO.getToken());
        responseDTO.setRefreshToken(userVO.getRefreshToken());
        responseDTO.setExpiresIn(userVO.getExpiresIn());

        log.info("[UserController-loginByEmailPassword] login succeeded, userId={}", responseDTO.getId());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), responseDTO);
    }

    @PostMapping("/wechat-mini-program/qrcode/generate")
    public BaseResponse<WechatMiniProgramQrCodeResponseDTO> generateWechatMiniProgramLoginQrCode() {
        log.info("[UserController-generateWechatMiniProgramLoginQrCode] request received");

        WechatMiniProgramQrCodeVO qrCodeVO = userService.generateWechatMiniProgramLoginQrCode();
        WechatMiniProgramQrCodeResponseDTO responseDTO = buildWechatMiniProgramQrCodeResponse(qrCodeVO);

        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), responseDTO);
    }

    @PostMapping("/wechat-mini-program/qrcode/status")
    public BaseResponse<WechatMiniProgramQrCodeResponseDTO> queryWechatMiniProgramLoginQrCodeStatus(
            @Valid @RequestBody WechatMiniProgramQrCodeStatusRequestDTO request) {
        log.info("[UserController-queryWechatMiniProgramLoginQrCodeStatus] request received, qrcodeId={}", request.getQrcodeId());

        WechatMiniProgramQrCodeVO qrCodeVO = userService.queryWechatMiniProgramLoginQrCodeStatus(request.getQrcodeId());
        WechatMiniProgramQrCodeResponseDTO responseDTO = buildWechatMiniProgramQrCodeResponse(qrCodeVO);

        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), responseDTO);
    }

    @PostMapping("/wechat-mini-program/qrcode/login")
    public BaseResponse<UserLoginResponseDTO> loginByWechatMiniProgramQrCode(
            @Valid @RequestBody WechatMiniProgramQrCodeLoginRequestDTO request) {
        log.info("[UserController-loginByWechatMiniProgramQrCode] request received");

        UserVO userVO = userService.loginByWechatMiniProgramQrCode(request.getTicket());
        UserLoginResponseDTO responseDTO = new UserLoginResponseDTO();
        responseDTO.setId(userVO.getId());
        responseDTO.setUsername(userVO.getUsername());
        responseDTO.setAccessToken(userVO.getToken());
        responseDTO.setRefreshToken(userVO.getRefreshToken());
        responseDTO.setExpiresIn(userVO.getExpiresIn());

        log.info("[UserController-loginByWechatMiniProgramQrCode] login succeeded, userId={}", responseDTO.getId());
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), responseDTO);
    }

    @PostMapping("/logout")
    public BaseResponse<Void> logout() {
        UserUtils userUtils = ThreadUtils.getUser();
        Long userId = userUtils == null ? null : userUtils.getId();

        log.info("[UserController-logout] logout request received, userId={}", userId);
        if (userId != null) {
            userService.logout(userId);
        }
        log.info("[UserController-logout] logout succeeded, userId={}", userId);

        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
    }

    private WechatMiniProgramQrCodeResponseDTO buildWechatMiniProgramQrCodeResponse(WechatMiniProgramQrCodeVO qrCodeVO) {
        WechatMiniProgramQrCodeResponseDTO responseDTO = new WechatMiniProgramQrCodeResponseDTO();
        responseDTO.setQrcodeId(qrCodeVO.getQrcodeId());
        responseDTO.setQrCodeUrl(qrCodeVO.getQrCodeUrl());
        responseDTO.setCustomLogoUrl(qrCodeVO.getCustomLogoUrl());
        responseDTO.setStatus(qrCodeVO.getStatus());
        responseDTO.setTicket(qrCodeVO.getTicket());
        responseDTO.setDisplayName(qrCodeVO.getDisplayName());
        responseDTO.setPhoto(qrCodeVO.getPhoto());
        return responseDTO;
    }
}
