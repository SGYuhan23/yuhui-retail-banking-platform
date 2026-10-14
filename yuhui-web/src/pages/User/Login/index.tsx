import {
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { Helmet, history, useModel } from '@umijs/max';
import { message, Button, Divider, Input, Form, Tabs, Spin } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  oauth_authorize_url,
  user_login,
  user_login_by_code,
  user_login_methods,
  user_me,
  user_send_code,
} from '@/services/api';
import {
  CURRENT_USER_KEY,
  buildCurrentUser,
  clearLoginSession,
  consumeOAuthFragment,
  saveLoginSession,
} from '@/utils/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(() => ({
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F7F2E6',
  },
  leftPanel: {
    flex: 0.83,
    backgroundColor: '#EFE7DB',
    backgroundImage: 'linear-gradient(135deg, #edf4f8 0%, #f8fafc 55%, #e4f0ec 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0',
    position: 'relative',
    minHeight: '100vh',
    filter: 'saturate(0.95)',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'rgba(247, 242, 230, 0.18)',
      pointerEvents: 'none',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100%',
      background:
        'linear-gradient(to right, rgba(247, 242, 230, 0) 0%, rgba(247, 242, 230, 0.55) 60%, rgba(247, 242, 230, 0.96) 100%)',
      pointerEvents: 'none',
    },
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#F7F2E6',
    '@media (max-width: 768px)': {
      flex: 'none',
      width: '100%',
      padding: '16px',
      minHeight: '100vh',
    },
  },
  loginCard: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#F7F2E6',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(139, 69, 19, 0.15)',
    padding: '24px 36px',
  },
  brandHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7A5638',
    color: '#F7F2E6',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  logoText: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#7A5638',
  },
  input: {
    height: '48px',
    borderRadius: '8px',
    border: '1px solid #C8A04A',
    backgroundColor: '#F7F2E6',
    '&:hover': {
      borderColor: '#7A5638',
      backgroundColor: '#F7F2E6',
      boxShadow: 'none',
    },
    '&.ant-input-affix-wrapper-focused': {
      borderColor: '#7A5638',
      boxShadow: 'none',
      backgroundColor: '#F7F2E6',
    },
    '& .ant-input': {
      backgroundColor: 'transparent',
    },
    '& .ant-input:focus': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    '&:hover .ant-input': {
      backgroundColor: 'transparent',
    },
    '&.ant-input-affix-wrapper-status-error, &.ant-input-status-error': {
      backgroundColor: '#F7F2E6 !important',
      boxShadow: 'none !important',
    },
    '&.ant-input-affix-wrapper-status-error:hover, &.ant-input-status-error:hover': {
      backgroundColor: '#F7F2E6 !important',
      boxShadow: 'none !important',
    },
    '&.ant-input-affix-wrapper-status-error.ant-input-affix-wrapper-focused, &.ant-input-status-error.ant-input-status-error:focus':
      {
        backgroundColor: '#F7F2E6 !important',
        boxShadow: 'none !important',
      },
    '&.ant-input-affix-wrapper-status-error .ant-input, &.ant-input-status-error .ant-input': {
      backgroundColor: 'transparent !important',
    },
  },
  tabs: {
    '& .ant-tabs-nav::before': {
      borderBottom: '1px solid #C8A04A',
    },
    '& .ant-tabs-tab': {
      color: '#3A2A1C',
    },
    '& .ant-tabs-tab:hover': {
      color: '#7A5638',
    },
    '& .ant-tabs-tab-active .ant-tabs-tab-btn': {
      color: '#7A5638 !important',
      fontWeight: 600,
    },
    '& .ant-tabs-ink-bar': {
      backgroundColor: '#7A5638',
    },
  },
  loginButton: {
    width: '100%',
    height: '48px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    backgroundColor: '#7A5638 !important',
    borderColor: '#7A5638 !important',
    color: '#F7F2E6 !important',
  },
  captchaButton: {
    borderRadius: '6px',
    backgroundColor: '#7A5638 !important',
    borderColor: '#7A5638 !important',
    color: '#F7F2E6 !important',
    height: '32px',
    padding: '0 10px',
  },
  helperText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#8A7D73',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '220px',
  },
  oauthSection: {
    marginTop: '8px',
  },
  oauthDivider: {
    color: '#8A7D73',
    fontSize: '13px',
    margin: '20px 0 16px',
  },
  oauthButtons: {
    display: 'flex',
    gap: '12px',
  },
  oauthButton: {
    flex: 1,
    height: '44px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid #C8A04A',
    backgroundColor: '#F7F2E6',
    color: '#3A2A1C',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#7A5638',
      color: '#7A5638',
      backgroundColor: '#F3EBDD',
    },
  },
  giteeMark: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#C71D23',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type TabKey = 'password' | 'emailCode' | 'smsCode';

type OAuthProviderMeta = {
  provider: string;
  label: string;
};

/** 登录方式 → 第三方提供方（oauth:gitee → gitee） */
const toProviderMeta = (method: string): OAuthProviderMeta => {
  const provider = method.substring('oauth:'.length);
  return { provider, label: provider.charAt(0).toUpperCase() + provider.slice(1) };
};

const Login: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [methods, setMethods] = useState<string[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('password');
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [oauthPending, setOauthPending] = useState('');

  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const [form] = Form.useForm();

  // 登录方式分组：与 auth-service 管理端开闭实时同步
  const passwordEnabled = methods.includes('password');
  const emailMethod = methods.find((m) => m.startsWith('email:')) || '';
  const smsMethod = methods.find((m) => m.startsWith('sms:')) || '';
  const oauthProviders = methods.filter((m) => m.startsWith('oauth:')).map(toProviderMeta);

  const fetchMethods = async () => {
    setMethodsLoading(true);
    try {
      const resp = await user_login_methods();
      if (resp?.code === 1000 && Array.isArray(resp.data)) {
        setMethods(resp.data);
      } else {
        message.error(resp?.message || '登录方式加载失败');
      }
    } catch {
      message.error('登录方式加载失败，请检查网络后刷新重试');
    } finally {
      setMethodsLoading(false);
    }
  };

  const redirectAfterLogin = () => {
    const urlParams = new URL(window.location.href).searchParams;
    const redirectUrl = urlParams.get('redirect') || '/';
    setTimeout(() => {
      history.push(redirectUrl);
    }, 100);
  };

  const handleLoginSuccess = (resp: any): boolean => {
    const loginData = resp?.data ?? resp;
    if (resp?.code !== 1000 || !loginData?.accessToken) {
      message.error(resp?.message || '登录失败，未获取到访问令牌');
      return false;
    }
    const currentUser = saveLoginSession(loginData);
    flushSync(() => {
      setInitialState((s) => ({
        ...s,
        currentUser,
      }));
    });
    redirectAfterLogin();
    return true;
  };

  // OAuth 回调：后端 302 回 /user/login#oauth=... 后在此完成登录
  useEffect(() => {
    const fragment = consumeOAuthFragment();
    if (!fragment) return;
    if (fragment.type === 'error') {
      message.error(fragment.message);
      return;
    }
    (async () => {
      // OAuth fragment 只带令牌，先落会话再向服务端换取用户身份
      saveLoginSession(fragment.data);
      try {
        const me = await user_me();
        if (me?.code === 1000 && me.data?.id) {
          const currentUser = buildCurrentUser({
            ...fragment.data,
            id: me.data.id,
            username: me.data.username,
            nickname: me.data.nickname,
            avatar: me.data.avatar,
            roles: me.data.roles,
            permissions: me.data.permissions,
          });
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
          flushSync(() => {
            setInitialState((s) => ({
              ...s,
              currentUser,
            }));
          });
          message.success('登录成功');
          redirectAfterLogin();
          return;
        }
      } catch {}
      clearLoginSession();
      message.error('第三方登录失败，请重试');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMethods();
  }, []);

  useEffect(() => {
    if (codeCooldown <= 0) return;
    const timer = setInterval(() => {
      setCodeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCooldown]);

  // 默认选中第一个可用的登录方式
  useEffect(() => {
    if (methodsLoading) return;
    const order: TabKey[] = ['password', 'emailCode', 'smsCode'];
    const available: Record<TabKey, boolean> = {
      password: passwordEnabled,
      emailCode: !!emailMethod,
      smsCode: !!smsMethod,
    };
    if (!available[activeTab]) {
      const first = order.find((key) => available[key]);
      if (first) {
        setActiveTab(first);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodsLoading, methods]);

  const handleSubmit = async (values: Record<string, string>) => {
    setSubmitting(true);
    try {
      if (activeTab === 'password') {
        const resp = await user_login({
          username: values.username || '',
          password: values.password || '',
        });
        handleLoginSuccess(resp);
        return;
      }
      const method = activeTab === 'emailCode' ? emailMethod : smsMethod;
      const resp = await user_login_by_code({
        method,
        target: values.target || '',
        code: values.code || '',
      });
      handleLoginSuccess(resp);
    } catch {
      message.error('操作失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const sendLoginCode = async () => {
    try {
      const target = await form.validateFields(['target']).then((result) => result.target);
      setSendCodeLoading(true);
      const method = activeTab === 'emailCode' ? emailMethod : smsMethod;
      const resp = await user_send_code({ method, target });
      if (resp?.code === 1000) {
        message.success('验证码已发送，请查收');
        setCodeCooldown(60);
      } else {
        message.error(resp?.message || '验证码发送失败');
      }
    } catch (error) {
      if ((error as any)?.errorFields) {
        return;
      }
      message.error('验证码发送失败');
    } finally {
      setSendCodeLoading(false);
    }
  };

  const startOAuthLogin = (provider: string) => {
    if (oauthPending) return;
    setOauthPending(provider);
    window.location.href = oauth_authorize_url(provider);
  };

  const tabItems = [];
  if (passwordEnabled) {
    tabItems.push({ key: 'password' as TabKey, label: '账号登录' });
  }
  if (emailMethod) {
    tabItems.push({ key: 'emailCode' as TabKey, label: '邮箱验证码登录' });
  }
  if (smsMethod) {
    tabItems.push({ key: 'smsCode' as TabKey, label: '短信验证码登录' });
  }

  const hasAnyMethod = tabItems.length > 0 || oauthProviders.length > 0;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>

      <div className={styles.leftPanel} />

      <div className={styles.rightPanel}>
        <div className={styles.loginCard}>
          <div className={styles.brandHeader}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>福</div>
              <h1 className={styles.logoText}>幸运补给站</h1>
            </div>
          </div>

          {methodsLoading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {tabItems.length > 0 && (
                <Form form={form} onFinish={handleSubmit} preserve={false}>
                  <Tabs
                    centered
                    className={styles.tabs}
                    activeKey={activeTab}
                    onChange={(key) => {
                      setActiveTab(key as TabKey);
                      form.resetFields();
                      setCodeCooldown(0);
                    }}
                    items={tabItems}
                  />

                  {activeTab === 'password' && (
                    <>
                      <Form.Item
                        name="username"
                        rules={[{ required: true, message: '用户名或邮箱是必填项' }]}
                      >
                        <Input
                          size="large"
                          prefix={<UserOutlined />}
                          placeholder="请输入用户名或邮箱"
                          className={styles.input}
                        />
                      </Form.Item>
                      <Form.Item
                        name="password"
                        rules={[{ required: true, message: '密码是必填项' }]}
                      >
                        <Input.Password
                          size="large"
                          prefix={<LockOutlined />}
                          placeholder="请输入密码"
                          autoComplete="current-password"
                          visibilityToggle={{
                            visible: passwordVisible,
                            onVisibleChange: setPasswordVisible,
                          }}
                          className={styles.input}
                        />
                      </Form.Item>
                    </>
                  )}

                  {(activeTab === 'emailCode' || activeTab === 'smsCode') && (
                    <>
                      <Form.Item
                        name="target"
                        rules={
                          activeTab === 'emailCode'
                            ? [
                                { required: true, message: '邮箱是必填项' },
                                { type: 'email', message: '邮箱格式不正确' },
                              ]
                            : [
                                { required: true, message: '手机号是必填项' },
                                {
                                  pattern: /^1\d{10}$/,
                                  message: '手机号格式不正确',
                                },
                              ]
                        }
                      >
                        <Input
                          size="large"
                          prefix={activeTab === 'emailCode' ? <MailOutlined /> : <MobileOutlined />}
                          placeholder={activeTab === 'emailCode' ? '请输入邮箱' : '请输入手机号'}
                          className={styles.input}
                        />
                      </Form.Item>
                      <Form.Item name="code" rules={[{ required: true, message: '验证码是必填项' }]}>
                        <Input
                          size="large"
                          prefix={<SafetyCertificateOutlined />}
                          placeholder="请输入验证码"
                          maxLength={6}
                          className={styles.input}
                          suffix={
                            <Button
                              type="primary"
                              size="small"
                              className={styles.captchaButton}
                              loading={sendCodeLoading}
                              disabled={codeCooldown > 0}
                              onClick={sendLoginCode}
                            >
                              {codeCooldown > 0 ? `${codeCooldown}s` : '发送验证码'}
                            </Button>
                          }
                        />
                      </Form.Item>
                    </>
                  )}

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.loginButton}
                      loading={submitting}
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              )}

              {activeTab === 'emailCode' && (
                <div className={styles.helperText}>未注册的邮箱将自动注册并登录</div>
              )}
              {activeTab === 'smsCode' && (
                <div className={styles.helperText}>未注册的手机号将自动注册并登录</div>
              )}
              {activeTab === 'password' && (
                <div className={styles.helperText}>
                  账号由管理员在认证服务中心创建分配或使用其他登录方式登录后创建
                </div>
              )}

              {oauthProviders.length > 0 && (
                <div className={styles.oauthSection}>
                  <Divider className={styles.oauthDivider}>其他登录方式</Divider>
                  <div className={styles.oauthButtons}>
                    {oauthProviders.map(({ provider, label }) => (
                      <div
                        key={provider}
                        className={styles.oauthButton}
                        onClick={() => startOAuthLogin(provider)}
                      >
                        {provider === 'github' ? (
                          <GithubOutlined style={{ fontSize: '20px' }} />
                        ) : (
                          <span className={styles.giteeMark}>G</span>
                        )}
                        <span>{label} 登录</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasAnyMethod && (
                <div className={styles.helperText}>
                  当前未开放任何登录方式，请联系管理员在认证服务中心开启
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
