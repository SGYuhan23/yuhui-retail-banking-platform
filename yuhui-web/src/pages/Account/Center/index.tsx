import {
  oauth_bind_authorize_url,
  user_login_methods,
  user_profile,
  user_profile_avatar,
  user_profile_bind_email,
  user_profile_bind_phone,
  user_profile_oauth_bindings,
  user_profile_oauth_unbind,
  user_profile_password,
  user_profile_unbind_email,
  user_profile_unbind_phone,
  user_profile_update,
  user_send_code,
} from '@/services/api';
import { ensureFreshToken } from '@/utils/auth';
import {
  GithubOutlined,
  KeyOutlined,
  LinkOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Popconfirm,
  Radio,
  Row,
  Space,
  Tag,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const formatTime = (millis?: number) => (millis ? new Date(millis).toLocaleString() : '--');

const AccountCenter: React.FC = () => {
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [profile, setProfile] = useState<API.AuthUser | null>(null);
  const [bindings, setBindings] = useState<API.AuthOAuthBinding[]>([]);
  const [oauthMethods, setOauthMethods] = useState<string[]>([]);
  const [profileForm] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const bindHandledRef = useRef(false);

  const loadProfile = useCallback(async () => {
    const [profileResp, bindingResp, methodResp] = await Promise.all([
      user_profile(),
      user_profile_oauth_bindings(),
      user_login_methods(),
    ]);
    if (profileResp?.code === 1000 && profileResp.data) {
      setProfile(profileResp.data);
      profileForm.setFieldsValue({
        nickname: profileResp.data.nickname,
        realName: profileResp.data.realName,
        gender: profileResp.data.gender,
        birthday: profileResp.data.birthday ? dayjs(profileResp.data.birthday) : undefined,
      });
    }
    if (bindingResp?.code === 1000) {
      setBindings(bindingResp.data || []);
    }
    if (methodResp?.code === 1000) {
      setOauthMethods((methodResp.data || []).filter((m: string) => m.startsWith('oauth:')));
    }
  }, [profileForm]);

  useEffect(() => {
    // OAuth 绑定回调重定向携带 #bind=success
    if (!bindHandledRef.current) {
      bindHandledRef.current = true;
      const hash = window.location.hash || '';
      if (hash === '#bind=success') {
        message.success('第三方账号绑定成功');
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timers = [emailCooldown, phoneCooldown].map((cd) =>
      cd > 0
        ? window.setTimeout(() => {
            if (cd === emailCooldown) setEmailCooldown((v) => Math.max(0, v - 1));
            if (cd === phoneCooldown) setPhoneCooldown((v) => Math.max(0, v - 1));
          }, 1000)
        : 0,
    );
    return () => timers.forEach(clearTimeout);
  }, [emailCooldown, phoneCooldown]);

  const refreshGlobalUser = async () => {
    const resp = await user_profile();
    if (resp?.code === 1000 && resp.data && initialState?.currentUser) {
      const roles = resp.data.roles || [];
      const next = {
        ...initialState.currentUser,
        name: resp.data.nickname || resp.data.username,
        nickname: resp.data.nickname,
        avatar: resp.data.avatar,
        roles,
        access: roles.includes('ROLE_ADMIN') ? 'admin' : 'user',
      };
      localStorage.setItem('currentUser', JSON.stringify(next));
      setInitialState((s) => ({ ...s, currentUser: next as any }));
    }
  };

  const submitProfile = async () => {
    const values = await profileForm.validateFields();
    const resp = await user_profile_update({
      nickname: values.nickname,
      realName: values.realName,
      gender: values.gender,
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
    });
    if (resp?.code === 1000) {
      message.success('个人资料已更新');
      loadProfile();
      refreshGlobalUser();
    } else {
      message.error(resp?.message || '保存失败');
    }
  };

  const submitPassword = async () => {
    const values = await pwdForm.validateFields();
    const resp = await user_profile_password(values.oldPassword, values.newPassword);
    if (resp?.code === 1000) {
      message.success('密码已修改');
      pwdForm.resetFields();
    } else {
      message.error(resp?.message || '修改失败');
    }
  };

  const uploadAvatar = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const resp = await user_profile_avatar(file as File);
      if (resp?.code === 1000 && resp.data?.url) {
        message.success('头像已更新');
        onSuccess?.(resp.data);
        loadProfile();
        refreshGlobalUser();
      } else {
        message.error(resp?.message || '头像上传失败');
        onError?.(new Error(resp?.message));
      }
    } catch (e) {
      onError?.(e as Error);
    }
  };

  const bindOAuth = async (provider: string) => {
    // 跳转走整页导航且 token 经查询参数传递，临期先静默刷新，避免代理透传后被判 401
    await ensureFreshToken();
    window.location.href = oauth_bind_authorize_url(provider);
  };

  const unbindOAuth = async (provider: string) => {
    const resp = await user_profile_oauth_unbind(provider);
    if (resp?.code === 1000) {
      message.success(`已解绑 ${provider}`);
      loadProfile();
    } else {
      message.error(resp?.message || '解绑失败');
    }
  };

  const sendBindCode = async (kind: 'email' | 'phone') => {
    try {
      const target = await (kind === 'email' ? emailForm : phoneForm).validateFields(['target']).then((r) => r.target);
      // 绑定验证码复用登录验证码通道：邮箱用当前启用的邮箱类方式，短信用 sms:aliyun
      const enabled = await user_login_methods();
      const available = (enabled?.data || []).find((m: string) => m.startsWith(kind === 'email' ? 'email:' : 'sms:'));
      if (!available) {
        message.error(kind === 'email' ? '邮箱验证码方式未启用' : '短信验证码方式未启用');
        return;
      }
      const resp = await user_send_code({ method: available, target });
      if (resp?.code === 1000) {
        message.success('验证码已发送');
        if (kind === 'email') setEmailCooldown(60);
        else setPhoneCooldown(60);
      } else {
        message.error(resp?.message || '验证码发送失败');
      }
    } catch (e: any) {
      if (!e?.errorFields) message.error('验证码发送失败');
    }
  };

  const submitBindEmail = async () => {
    const values = await emailForm.validateFields();
    const enabled = await user_login_methods();
    const available = (enabled?.data || []).find((m: string) => m.startsWith('email:'));
    if (!available) {
      message.error('邮箱验证码方式未启用');
      return;
    }
    const resp = await user_profile_bind_email(available, values.target, values.code);
    if (resp?.code === 1000) {
      message.success('邮箱已绑定（视为已验证）');
      emailForm.resetFields();
      loadProfile();
    } else {
      message.error(resp?.message || '绑定失败');
    }
  };

  const submitBindPhone = async () => {
    const values = await phoneForm.validateFields();
    const resp = await user_profile_bind_phone('sms:aliyun', values.target, values.code);
    if (resp?.code === 1000) {
      message.success('手机号已绑定（视为已验证）');
      phoneForm.resetFields();
      loadProfile();
    } else {
      message.error(resp?.message || '绑定失败');
    }
  };

  const unbindEmail = async () => {
    const resp = await user_profile_unbind_email();
    if (resp?.code === 1000) {
      message.success('邮箱已解绑');
      loadProfile();
    } else {
      message.error(resp?.message || '解绑失败');
    }
  };

  const unbindPhone = async () => {
    const resp = await user_profile_unbind_phone();
    if (resp?.code === 1000) {
      message.success('手机号已解绑');
      loadProfile();
    } else {
      message.error(resp?.message || '解绑失败');
    }
  };

  const availableOauth = oauthMethods.map((m: string) => m.substring('oauth:'.length));

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card title="个人信息" loading={!profile}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Upload accept="image/*" showUploadList={false} customRequest={uploadAvatar}>
              <div style={{ cursor: 'pointer', position: 'relative' }}>
                <Avatar size={96} src={profile?.avatar} style={{ backgroundColor: '#7A5638' }}>
                  {(profile?.nickname || profile?.username || '?').slice(0, 1).toUpperCase()}
                </Avatar>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>点击更换头像（≤2MB）</div>
              </div>
            </Upload>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{profile?.nickname || profile?.username}</div>
            <div style={{ color: '#666', fontSize: 13 }}>账号：{profile?.username}</div>
            <Space wrap>
              {(profile?.roles || []).map((r) => (
                <Tag key={r} color={r === 'ROLE_ADMIN' ? 'gold' : 'default'}>
                  {r}
                </Tag>
              ))}
            </Space>
            {(bindings.length > 0 || /^(gitee|github|email|sms)_/.test(profile?.username || '')) && (
              <div
                style={{
                  background: '#FFF7E6',
                  border: '1px solid #FFD591',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 12,
                  color: '#874D00',
                  marginTop: 4,
                  textAlign: 'left',
                }}
              >
                第三方/验证码登录创建的账号初始密码由系统随机生成，不可用于密码登录；如需密码登录，请联系管理员在「认证管理
                › 用户管理」中为您设置密码。
              </div>
            )}
            <div style={{ color: '#999', fontSize: 12 }}>
              注册于 {formatTime(profile?.createdAt)} · 最近登录 {formatTime(profile?.lastLoginAt)}
            </div>
          </div>
          <Divider />
          <Form form={profileForm} layout="vertical">
            <Form.Item name="nickname" label="昵称">
              <Input prefix={<UserOutlined />} placeholder="昵称" />
            </Form.Item>
            <Form.Item name="realName" label="真实姓名">
              <Input placeholder="真实姓名" />
            </Form.Item>
            <Form.Item name="gender" label="性别">
              <Radio.Group
                options={[
                  { value: 0, label: '未知' },
                  { value: 1, label: '男' },
                  { value: 2, label: '女' },
                ]}
              />
            </Form.Item>
            <Form.Item name="birthday" label="生日">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" block onClick={submitProfile}>
              保存资料
            </Button>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="账号绑定">
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  <MailOutlined /> 邮箱
                </div>
                {profile?.email ? (
                  <Space>
                    <span>{profile.email}</span>
                    {profile.emailVerified && <Tag color="green">已验证</Tag>}
                    <Popconfirm title="确定解绑邮箱吗？" onConfirm={unbindEmail}>
                      <Button size="small" danger>
                        解绑
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : (
                  <Form form={emailForm} layout="inline" onFinish={submitBindEmail}>
                    <Form.Item
                      name="target"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '邮箱格式不正确' },
                      ]}
                    >
                      <Input placeholder="新邮箱" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
                      <Input
                        placeholder="验证码"
                        style={{ width: 110 }}
                        suffix={
                          <Button
                            size="small"
                            type="primary"
                            disabled={emailCooldown > 0}
                            onClick={() => sendBindCode('email')}
                          >
                            {emailCooldown > 0 ? `${emailCooldown}s` : '发码'}
                          </Button>
                        }
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">绑定邮箱</Button>
                    </Form.Item>
                  </Form>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  <MobileOutlined /> 手机号
                </div>
                {profile?.phone ? (
                  <Space>
                    <span>{profile.phone}</span>
                    {profile.phoneVerified && <Tag color="green">已验证</Tag>}
                    <Popconfirm title="确定解绑手机号吗？" onConfirm={unbindPhone}>
                      <Button size="small" danger>
                        解绑
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : (
                  <Form form={phoneForm} layout="inline" onFinish={submitBindPhone}>
                    <Form.Item
                      name="target"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
                      ]}
                    >
                      <Input placeholder="新手机号" style={{ width: 160 }} />
                    </Form.Item>
                    <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
                      <Input
                        placeholder="验证码"
                        style={{ width: 110 }}
                        suffix={
                          <Button
                            size="small"
                            type="primary"
                            disabled={phoneCooldown > 0}
                            onClick={() => sendBindCode('phone')}
                          >
                            {phoneCooldown > 0 ? `${phoneCooldown}s` : '发码'}
                          </Button>
                        }
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">绑定手机</Button>
                    </Form.Item>
                  </Form>
                )}
              </div>

              <Divider style={{ margin: '8px 0' }} />
              <div>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>
                  <LinkOutlined /> 第三方账号
                </div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {availableOauth.map((provider) => {
                    const binding = bindings.find((b) => b.provider === provider);
                    return (
                      <div
                        key={provider}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          padding: '8px 12px',
                        }}
                      >
                        <Space>
                          {provider === 'github' ? (
                            <GithubOutlined style={{ fontSize: 20 }} />
                          ) : (
                            <Avatar size={20} style={{ backgroundColor: '#C71D23', fontSize: 12 }}>
                              G
                            </Avatar>
                          )}
                          <span style={{ textTransform: 'capitalize' }}>{provider}</span>
                          {binding ? (
                            <Tag color="green">已绑定（{binding.providerUid}）</Tag>
                          ) : (
                            <Tag>未绑定</Tag>
                          )}
                        </Space>
                        {binding ? (
                          <Popconfirm title={`确定解绑 ${provider} 吗？`} onConfirm={() => unbindOAuth(provider)}>
                            <Button size="small" danger>
                              解绑
                            </Button>
                          </Popconfirm>
                        ) : (
                          <Button size="small" type="primary" ghost onClick={() => bindOAuth(provider)}>
                            绑定
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {availableOauth.length === 0 && <Tag>当前未启用任何第三方登录方式</Tag>}
                </Space>
              </div>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="修改密码">
              <Form form={pwdForm} layout="vertical" style={{ maxWidth: 380 }}>
                <Form.Item name="oldPassword" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
                  <Input.Password prefix={<KeyOutlined />} placeholder="当前密码" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, max: 50, message: '长度 6~50 位' },
                  ]}
                >
                  <Input.Password prefix={<KeyOutlined />} placeholder="新密码（6~50 位）" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请再次输入新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<KeyOutlined />} placeholder="确认新密码" />
                </Form.Item>
                <Button type="primary" onClick={submitPassword}>
                  修改密码
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default AccountCenter;
