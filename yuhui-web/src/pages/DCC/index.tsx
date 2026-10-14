import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Switch, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { dcc_value, dcc_config } from '@/services/api';

const DCC: React.FC = () => {
  const [configs, setConfigs] = useState({
    degradeSwitch: 'close',
    rateLimiterSwitch: 'open',
  });

  const [loading, setLoading] = useState({
    degradeSwitch: false,
    rateLimiterSwitch: false,
  });

  // 获取配置值
  const fetchConfig = async (key: string) => {
    try {
      const response = await dcc_value(key);
      // 确保我们只使用响应中的数据部分
      const value = response.data || 'close';
      setConfigs((prev) => ({
        ...prev,
        [key]: value,
      }));
    } catch (error) {
      message.error(`获取${key}配置失败`);
    }
  };

  // 更新配置
  const updateConfig = async (key: string, value: string) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await dcc_config({
        key,
        value,
      });
      if (response.code === 1000) {
        message.success('配置更新成功');
        setConfigs((prev) => ({
          ...prev,
          [key]: value,
        }));
      } else {
        message.error(response.message || '配置更新失败');
      }
    } catch (error) {
      message.error('配置更新失败');
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    fetchConfig('degradeSwitch');
    fetchConfig('rateLimiterSwitch');
  }, []);

  const configItems = [
    {
      key: 'degradeSwitch',
      title: '抽奖降级开关',
      description: '控制抽奖是否降级，默认关闭',
    },
    {
      key: 'rateLimiterSwitch',
      title: '抽奖限流开关',
      description: '控制抽奖是否进行限流，默认开启',
    },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        {configItems.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
            <Card
              title={item.title}
              variant={true ? 'outlined' : 'borderless'}
              style={{ height: '100%' }}
            >
              <p>{item.description}</p>
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Switch
                  checked={configs[item.key as keyof typeof configs] === 'open'}
                  loading={loading[item.key as keyof typeof loading]}
                  onChange={(checked) => {
                    updateConfig(item.key, checked ? 'open' : 'close');
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  当前状态: {configs[item.key as keyof typeof configs]}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
};

export default DCC;
