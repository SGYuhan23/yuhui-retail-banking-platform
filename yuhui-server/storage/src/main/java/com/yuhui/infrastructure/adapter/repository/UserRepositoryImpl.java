package com.yuhui.infrastructure.adapter.repository;
import com.yuhui.identity.model.vo.UserVO;
import com.yuhui.identity.model.vo.WechatMiniProgramQrCodeVO;
import com.yuhui.identity.repository.IUserRepository;
import org.springframework.stereotype.Repository;

/** Authentication is intentionally outside the local replica scope. */
@Repository
public class UserRepositoryImpl implements IUserRepository {
    private UnsupportedOperationException excluded() { return new UnsupportedOperationException("独立认证服务未接入，请使用本地体验用户"); }
    public void sendEmailRegisterCode(String email) { throw excluded(); }
    public UserVO registerByEmail(String email, String passCode, String password) { throw excluded(); }
    public UserVO loginByEmailPassword(String email, String password) { throw excluded(); }
    public UserVO refreshToken(String refreshToken) { throw excluded(); }
    public WechatMiniProgramQrCodeVO generateWechatMiniProgramLoginQrCode() { throw excluded(); }
    public WechatMiniProgramQrCodeVO queryWechatMiniProgramLoginQrCodeStatus(String qrcodeId) { throw excluded(); }
    public UserVO loginByWechatMiniProgramQrCode(String ticket) { throw excluded(); }
    public void logout(Long userId) { }
}
