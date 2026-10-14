import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tabs,
  Card,
  Modal,
  Descriptions,
  Alert,
} from 'antd';
import { api, Shell, options, perform, labels, money } from './shared';
export default function Merchants() {
  const [cat, setCat] = useState<any>({ scenes: [], merchants: [], benefits: [] }),
    [mode, setMode] = useState(''),
    [code, setCode] = useState(''),
    [entitlement, setEntitlement] = useState<any>(),
    [merchant, setMerchant] = useState<number>(),
    [spend, setSpend] = useState<number>(4000);
  const [form] = Form.useForm();
  const load = () => api('/catalog').then(setCat);
  useEffect(() => {
    perform(load);
  }, []);
  const open = (m: string) => {
    setMode(m);
    form.resetFields();
    form.setFieldsValue({
      scene_id: 'COMMUNITY',
      district: '涪陵',
      category: '合成生活商户',
      type: 'COUPON',
      face_value: 2000,
      minimum_spend: 4000,
      bank_cost: 1200,
      merchant_cost: 800,
      points_price: 0,
      valid_days: 7,
      total_stock: 1000,
    });
  };
  return (
    <Shell
      title="商户与权益"
      subtitle="商户及成本均为 Synthetic Demo Assumption。核销校验权益码、商户范围、场景、状态、有效期与使用门槛。"
    >
      <Tabs
        items={[
          {
            key: 'merchant',
            label: '场景与商户',
            children: (
              <>
                <Space>
                  {cat.scenes.map((s: any) => (
                    <Card size="small" key={s.id}>
                      {s.name}
                    </Card>
                  ))}
                </Space>
                <p>
                  <Button onClick={() => open('merchants')}>新增虚构商户</Button>
                </p>
                <Table
                  rowKey="id"
                  dataSource={cat.merchants}
                  columns={[
                    { title: '商户', dataIndex: 'name' },
                    { title: '地区', dataIndex: 'district' },
                    { title: '场景', dataIndex: 'scene_id', render: (v) => labels[v] },
                    { title: '状态', dataIndex: 'status' },
                    { title: '数据标记', render: () => 'Mock Data' },
                  ]}
                />
              </>
            ),
          },
          {
            key: 'benefit',
            label: '权益模板',
            children: (
              <>
                <Button onClick={() => open('benefits')}>新增权益模板</Button>
                <Table
                  rowKey="id"
                  dataSource={cat.benefits}
                  scroll={{ x: true }}
                  columns={[
                    { title: '权益', dataIndex: 'name' },
                    { title: '类型', dataIndex: 'type', render: (v) => labels[v] },
                    { title: '面值', dataIndex: 'face_value', render: money },
                    { title: '最低消费', dataIndex: 'minimum_spend', render: money },
                    { title: '银行成本/核销', dataIndex: 'bank_cost', render: money },
                    { title: '商户让利/核销', dataIndex: 'merchant_cost', render: money },
                    { title: '积分', dataIndex: 'points_price' },
                    { title: '有效天数', dataIndex: 'valid_days' },
                    {
                      title: '已发 / 总库存',
                      render: (_: any, r: any) => `${r.issued_stock} / ${r.total_stock}`,
                    },
                  ]}
                />
              </>
            ),
          },
          {
            key: 'redeem',
            label: '商户模拟核销',
            children: (
              <Card title="核销生活权益">
                <Alert message="仅模拟消费与核销，不产生真实支付或清结算。" />
                <Space style={{ marginTop: 20 }}>
                  <Input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setEntitlement(undefined);
                    }}
                    placeholder="输入模拟权益码 YH-…"
                    style={{ width: 350 }}
                  />
                  <Button
                    onClick={() =>
                      perform(async () =>
                        setEntitlement(await api(`/entitlements/${encodeURIComponent(code)}`)),
                      )
                    }
                  >
                    查询权益
                  </Button>
                </Space>
                {entitlement && (
                  <Descriptions
                    bordered
                    column={1}
                    style={{ marginTop: 16 }}
                    items={[
                      { key: 'name', label: '权益', children: entitlement.terms.name },
                      { key: 'status', label: '状态', children: labels[entitlement.status] },
                      { key: 'expiry', label: '有效期至', children: entitlement.expires_at },
                      {
                        key: 'merchant',
                        label: '适用商户',
                        children: entitlement.terms.merchant.name,
                      },
                      {
                        key: 'min',
                        label: '最低消费',
                        children: money(entitlement.terms.minimum_spend),
                      },
                    ]}
                  />
                )}
                <p>当前模拟商户</p>
                <Select
                  style={{ width: 300 }}
                  options={options(cat.merchants)}
                  value={merchant}
                  onChange={setMerchant}
                />
                <p>模拟消费金额（分）</p>
                <InputNumber value={spend} min={0} onChange={(v) => setSpend(v || 0)} />
                <p>
                  <Button
                    type="primary"
                    disabled={!entitlement || !merchant || entitlement.status !== 'AVAILABLE'}
                    onClick={() =>
                      perform(async () => {
                        await api('/redeem', 'POST', {
                          code,
                          merchant_id: merchant,
                          mock_spend: spend,
                        });
                        setEntitlement(await api(`/entitlements/${encodeURIComponent(code)}`));
                      })
                    }
                  >
                    确认模拟核销
                  </Button>
                </p>
              </Card>
            ),
          },
        ]}
      />
      <Modal
        title={mode === 'merchants' ? '新增虚构商户' : '新增权益模板'}
        open={!!mode}
        width={650}
        onCancel={() => setMode('')}
        onOk={() =>
          perform(async () => {
            await api(`/${mode}`, 'POST', await form.validateFields());
            setMode('');
          }, load)
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="名称（必须为虚构商户 / 演示权益）"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="scene_id" label="场景" rules={[{ required: true }]}>
            <Select options={options(cat.scenes)} />
          </Form.Item>
          {mode === 'merchants' ? (
            <>
              <Form.Item name="district" label="地区" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="category" label="类别" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="type" label="类型">
                <Select
                  options={['COUPON', 'POINTS_EXCHANGE', 'DRAW_REWARD'].map((value) => ({
                    value,
                    label: labels[value],
                  }))}
                />
              </Form.Item>
              {[
                ['face_value', '权益面值（分）'],
                ['minimum_spend', '最低消费（分）'],
                ['bank_cost', '银行成本（分）'],
                ['merchant_cost', '商户让利（分）'],
                ['points_price', '兑换积分（仅积分兑换填写正数）'],
                ['valid_days', '有效天数'],
                ['total_stock', '总库存'],
              ].map(([name, label]) => (
                <Form.Item key={name} name={name} label={label} rules={[{ required: true }]}>
                  <InputNumber min={0} />
                </Form.Item>
              ))}
            </>
          )}
        </Form>
      </Modal>
    </Shell>
  );
}
