import { auth_login_method_save, auth_login_methods } from '@/services/api';
import { KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Modal, Radio, Space, Switch, Tag, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const categoryColor: Record<string, string> = {
  password: 'orange',
  email: 'blue',
  sms: 'green',
  oauth: 'purple',
};

const LoginMethods: React.FC = () => {
  const { message } = App.useApp();
  const [configs, setConfigs] = useState<API.AuthLoginMethodConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [configTarget, setConfigTarget] = useState<API.AuthLoginMethodConfig | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [configForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await auth_login_methods();
      if (resp?.code === 1000) {
        setConfigs(resp.data || []);
      } else {
        message.error(resp?.message || '登录方式配置加载失败');
      }
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEnabled = async (cfg: API.AuthLoginMethodConfig, enabled: boolean) => {
    if (cfg.method === 'password') {
      message.info('账号密码为平台锁定方式，不可关闭');
      return;
    }
    setSaving(true);
    try {
      const resp = await auth_login_method_save(cfg.method, {
        enabled: enabled ? 1 : 0,
        usePlatformConfig: (cfg.usePlatformConfig ?? 1) as 0 | 1,
      });
      if (resp?.code === 1000) {
        message.success(enabled ? `已开启 ${cfg.displayName}` : `已关闭 ${cfg.displayName}`);
        load();
      } else {
        message.error(resp?.message || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const openConfig = (cfg: API.AuthLoginMethodConfig) => {
    setConfigTarget(cfg);
    configForm.setFieldsValue({
      usePlatformConfig: cfg.usePlatformConfig ?? 1,
      configJson: '',
    });
    setConfigOpen(true);
  };

  const submitConfig = async () => {
    const values = await configForm.validateFields();
    const resp = await auth_login_method_save(configTarget!.method, {
      enabled: (configTarget!.enabled ?? 1) as 0 | 1,
      usePlatformConfig: values.usePlatformConfig,
      configJson: values.configJson || undefined,
    });
    if (resp?.code === 1000) {
      message.success('凭证配置已保存');
      setConfigOpen(false);
      load();
    } else {
      message.error(resp?.message || '保存失败');
    }
  };

  return (
    <Card
      title="登录方式管理"
      extra={
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          刷新
        </Button>
      }
    >
      <Typography.Paragraph type="secondary">
        开关立即生效并同步到登录页。平台未开启的方式无法在租户开启；邮箱类方式互斥（启用一种需先关闭另一种）。
      </Typography.Paragraph>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {configs.map((cfg) => (
          <Card
            key={cfg.method}
            size="small"
            loading={loading}
            title={
              <Space>
                <Tag color={categoryColor[cfg.category] || 'default'}>{cfg.category}</Tag>
                {cfg.displayName}
              </Space>
            }
            extra={
              <Switch
                checked={cfg.enabled === 1}
                onChange={(checked) => toggleEnabled(cfg, checked)}
                disabled={saving || (cfg.method !== 'password' && !cfg.platformEnabled)}
              />
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                <Typography.Text type="secondary">编码：</Typography.Text>
                <Typography.Text code>{cfg.method}</Typography.Text>
              </div>
              <div>
                <Typography.Text type="secondary">凭证：</Typography.Text>
                {cfg.hasConfig ? <Tag color="green">已配置</Tag> : <Tag color="red">未配置</Tag>}
                {cfg.method !== 'password' && (
                  <Tag>{cfg.usePlatformConfig === 1 ? '平台凭证' : '自有凭证'}</Tag>
                )}
              </div>
              {cfg.method !== 'password' && !cfg.platformEnabled && (
                <Typography.Text type="warning" style={{ fontSize: 12 }}>
                  平台未开启该方式，无法在此启用
                </Typography.Text>
              )}
              {cfg.method !== 'password' && (
                <Button size="small" icon={<KeyOutlined />} onClick={() => openConfig(cfg)}>
                  凭证设置
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={`凭证设置 - ${configTarget?.displayName || ''}`}
        open={configOpen}
        onOk={submitConfig}
        onCancel={() => setConfigOpen(false)}
        destroyOnClose
      >
        <Form form={configForm} layout="vertical" preserve={false}>
          <Form.Item name="usePlatformConfig" label="凭证来源">
            <Radio.Group
              options={[
                { value: 1, label: '使用平台默认凭证' },
                { value: 0, label: '使用本租户自有凭证' },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.usePlatformConfig !== cur.usePlatformConfig}
          >
            {({ getFieldValue }) =>
              getFieldValue('usePlatformConfig') === 0 ? (
                <Form.Item
                  name="configJson"
                  label="自有凭证 JSON（按非空键合并，留空表示不修改）"
                  extra='示例 email:smtp {"host":"smtp.qq.com","port":"465","username":"x@qq.com","password":"授权码"}；oauth {"clientId":"...","clientSecret":"...","redirectUri":"http://localhost:8091/api/v1/user/oauth/xxx/callback"}'
                >
                  <Input.TextArea rows={5} placeholder='{"host":"...","port":"465","username":"...","password":"..."}' />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default LoginMethods;
