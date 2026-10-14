import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Steps,
  Modal,
  Table,
  Tabs,
  Alert,
  Card,
} from 'antd';
import { Link } from '@umijs/max';
import { api, Shell, options, perform, parse, labels, money } from './shared';
export default function Campaigns() {
  const [items, setItems] = useState<any[]>([]),
    [versions, setVersions] = useState<any[]>([]),
    [runs, setRuns] = useState<any[]>([]),
    [segments, setSegments] = useState<any[]>([]),
    [cat, setCat] = useState<any>({ scenes: [], merchants: [], benefits: [] }),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<any>(),
    [step, setStep] = useState(0),
    [detail, setDetail] = useState<any>(),
    [execute, setExecute] = useState<any>(),
    [members, setMembers] = useState<any[]>([]),
    [user, setUser] = useState(''),
    [merchant, setMerchant] = useState<number>(),
    [result, setResult] = useState<any>();
  const [form] = Form.useForm();
  const scene = Form.useWatch('scene_id', form);
  const load = () =>
    Promise.all([
      api('/campaigns').then(setItems),
      api('/versions').then(setVersions),
      api('/runs').then(setRuns),
      api('/segments').then(setSegments),
      api('/catalog').then(setCat),
    ]);
  useEffect(() => {
    perform(load);
  }, []);
  const edit = (r?: any) => {
    setEditing(r);
    setOpen(true);
    setStep(0);
    const cfg = r ? parse(r.config_json) : {};
    form.resetFields();
    form.setFieldsValue({
      name: '社区生活权益试点',
      objective: 'CUSTOMER_REACTIVATION',
      segment_id: segments[0]?.id,
      scene_id: 'COMMUNITY',
      benefit_id: cat.benefits.find((b: any) => b.type === 'COUPON')?.id,
      merchant_ids: cat.merchants
        .filter((m: any) => m.scene_id === 'COMMUNITY')
        .map((m: any) => m.id),
      bank_budget_total: 600000,
      target_metric: 'MOCK_COMMUNITY_PURCHASE',
      target_value: 150,
      start_time: '2026-10-01 00:00:00',
      end_time: '2026-12-31 23:59:59',
      guardrail_config: {
        max_bank_budget: 600000,
        max_cost_per_target_action: 2400,
        min_redemption_rate: 0.3,
        max_budget_burn_rate: 0.9,
      },
      ...cfg,
    });
  };
  const mutate = (id: number, action: string) =>
    perform(async () => {
      try { await api(`/campaigns/${id}/${action}`, 'POST'); } finally { await load(); }
    });
  const stage = (type: string) =>
    perform(() =>
      api(`/runs/${execute.id}/events`, 'POST', {
        customer_id: user,
        event_type: type,
        action: parse(versions.find((v) => v.id === execute.campaign_version_id).config_json)
          .target_metric,
      }),
    );
  return (
    <Shell
      title="活动经营"
      subtitle="先确定经营目标，再选择客群、权益与预算。发布时冻结版本，批次只引用不可变版本。"
    >
      <Button type="primary" onClick={() => edit()} style={{ marginBottom: 16 }}>
        新建经营方案
      </Button>
      <Tabs
        items={[
          {
            key: 'campaign',
            label: '活动方案',
            children: (
              <Table
                rowKey="id"
                dataSource={items}
                columns={[
                  { title: '名称', dataIndex: 'name' },
                  { title: '经营目标', render: (_, r) => labels[parse(r.config_json).objective] },
                  { title: '状态', dataIndex: 'status', render: (v) => labels[v] },
                  {
                    title: '预算',
                    render: (_, r) => money(parse(r.config_json).bank_budget_total),
                  },
                  {
                    title: '操作',
                    render: (_, r) => (
                      <Space wrap>
                        <Button onClick={() => setDetail(parse(r.config_json))}>查看方案</Button>
                        {r.review_config_json && (
                          <Button onClick={() => setDetail({
                            说明: '复核对象为以下提交快照；发布会再次校验执行配置与客群规则。',
                            SHA256: r.review_config_hash,
                            提交时间: r.review_submitted_at,
                            通过时间: r.review_approved_at,
                            提交配置: parse(r.review_config_json),
                          })}>查看提交复核快照</Button>
                        )}
                        {r.status === 'DRAFT' && (
                          <>
                            <Button onClick={() => edit(r)}>编辑</Button>
                            <Button onClick={() => mutate(r.id, 'submit')}>提交复核</Button>
                          </>
                        )}
                        {r.status === 'PENDING_REVIEW' && (
                          <>
                            <Button onClick={() => mutate(r.id, 'approve')}>复核通过</Button>
                            <Button onClick={() => mutate(r.id, 'reject')}>退回</Button>
                          </>
                        )}
                        {r.status === 'APPROVED' && (
                          <Button type="primary" onClick={() => mutate(r.id, 'publish')}>
                            发布冻结版本
                          </Button>
                        )}
                      </Space>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'version',
            label: '发布版本',
            children: (
              <Table
                rowKey="id"
                dataSource={versions}
                columns={[
                  { title: '版本编号', dataIndex: 'id' },
                  { title: '活动', render: (_, r) => parse(r.config_json).name },
                  { title: '快照编号', dataIndex: 'segment_snapshot_id' },
                  { title: '发布时间', dataIndex: 'created_at' },
                  {
                    title: '操作',
                    render: (_, r) => (
                      <Space>
                        <Button onClick={() => setDetail(parse(r.config_json))}>
                          查看冻结配置
                        </Button>
                        <Button
                          onClick={() => perform(() => api(`/versions/${r.id}/runs`, 'POST'), load)}
                        >
                          创建投放批次
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'run',
            label: '投放批次',
            children: (
              <Table
                rowKey="id"
                dataSource={runs}
                columns={[
                  { title: '批次编号', dataIndex: 'id' },
                  { title: '活动', dataIndex: 'name' },
                  { title: '状态', dataIndex: 'status', render: (v) => labels[v] },
                  { title: '执行窗口', render: (_, r) => `${r.start_time} — ${r.end_time}` },
                  {
                    title: '操作',
                    render: (_, r) => (
                      <Space wrap>
                        {r.status === 'RUNNING' && (
                          <>
                            <Button
                              onClick={() =>
                                perform(async () => {
                                  setExecute(r);
                                  setUser('');
                                  setResult(undefined);
                                  setMembers(
                                    await api(`/snapshots/${r.segment_snapshot_id}/members`),
                                  );
                                })
                              }
                            >
                              执行模拟投放
                            </Button>
                            <Button
                              onClick={() => perform(() => api(`/runs/${r.id}/end`, 'POST'), load)}
                            >
                              结束批次
                            </Button>
                          </>
                        )}
                        <Link to={`/operating/review?run=${r.id}`}>复盘</Link>
                      </Space>
                    ),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑经营方案' : '新建经营方案'}
        open={open}
        width={900}
        onCancel={() => setOpen(false)}
        footer={
          <Space>
            {step > 0 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
            {step < 4 ? (
              <Button type="primary" onClick={() => setStep(step + 1)}>
                下一步
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() =>
                  perform(async () => {
                    const v = await form.validateFields();
                    await api(
                      editing ? `/campaigns/${editing.id}` : '/campaigns',
                      editing ? 'PUT' : 'POST',
                      v,
                    );
                    setOpen(false);
                  }, load)
                }
              >
                保存草稿
              </Button>
            )}
          </Space>
        }
      >
        <Steps
          current={step}
          size="small"
          items={['经营目标', '目标客群', '场景与权益', '预算与停止规则', '复核发布'].map(
            (title) => ({ title }),
          )}
          style={{ marginBottom: 24 }}
        />
        <Form form={form} layout="vertical">
          <div style={{ display: step === 0 ? 'block' : 'none' }}>
            <Form.Item name="name" label="方案名称" rules={[{ required: true }]}>
              <Input maxLength={160} />
            </Form.Item>
            <Form.Item name="objective" label="经营目标" rules={[{ required: true }]}>
              <Select
                options={['CUSTOMER_REACTIVATION', 'MERCHANT_TRAFFIC', 'POINTS_BURN'].map(
                  (value) => ({ value, label: labels[value] }),
                )}
              />
            </Form.Item>
          </div>
          <div style={{ display: step === 1 ? 'block' : 'none' }}>
            <Form.Item name="segment_id" label="目标客群" rules={[{ required: true }]}>
              <Select options={options(segments)} />
            </Form.Item>
            <Alert message="发布时冻结成员及当时属性；自动排除未许可营销的客户。" />
            <Button
              onClick={() =>
                perform(async () => {
                  const s = segments.find((x) => x.id === form.getFieldValue('segment_id'));
                  setDetail(await api('/segments/preview', 'POST', parse(s.rule_json)));
                })
              }
            >
              预览客群规模与分布
            </Button>
          </div>
          <div style={{ display: step === 2 ? 'block' : 'none' }}>
            <Form.Item name="scene_id" label="场景" rules={[{ required: true }]}>
              <Select
                options={options(cat.scenes)}
                onChange={() => form.setFieldsValue({ benefit_id: undefined, merchant_ids: [] })}
              />
            </Form.Item>
            <Form.Item name="benefit_id" label="权益" rules={[{ required: true }]}>
              <Select
                options={options(
                  cat.benefits.filter((b: any) => b.scene_id === scene && b.type !== 'DRAW_REWARD'),
                )}
              />
            </Form.Item>
            <Form.Item name="merchant_ids" label="允许商户范围" rules={[{ required: true }]}>
              <Select
                mode="multiple"
                options={options(cat.merchants.filter((m: any) => m.scene_id === scene))}
              />
            </Form.Item>
            <p>成本与商户让利仅用于合成演示；发布时冻结，不向消费者展示。</p>
          </div>
          <div style={{ display: step === 3 ? 'block' : 'none' }}>
            <Space align="start">
              <Form.Item
                name="bank_budget_total"
                label="银行预算（分）"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={1000000000} />
              </Form.Item>
              <Form.Item
                name={['guardrail_config', 'max_bank_budget']}
                label="硬预算上限（分）"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item
                name={['guardrail_config', 'max_cost_per_target_action']}
                label="目标行为客户成本上限（分）"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} />
              </Form.Item>
            </Space>
            <Space>
              <Form.Item
                name={['guardrail_config', 'min_redemption_rate']}
                label="最低核销率（0–1）"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={1} step={0.05} />
              </Form.Item>
              <Form.Item
                name={['guardrail_config', 'max_budget_burn_rate']}
                label="最高预算占用率（0–1）"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={1} step={0.05} />
              </Form.Item>
            </Space>
            <Form.Item name="target_metric" label="预定义目标行为" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'MOCK_COMMUNITY_PURCHASE', label: '观察窗口内完成模拟社区消费' },
                  { value: 'MOCK_VALID_ACTIVITY', label: '观察窗口内完成模拟有效活跃' },
                ]}
              />
            </Form.Item>
            <Form.Item name="target_value" label="目标行为客户数" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              name="start_time"
              label="开始时间（上海时间 YYYY-MM-DD HH:mm:ss）"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="end_time" label="结束时间 / 观察窗口结束" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
          <div style={{ display: step === 4 ? 'block' : 'none' }}>
            <Alert
              type="warning"
              message="轻量复核：保存草稿 → 提交复核 → 通过 → 发布"
              description="本地演示允许一人切换操作角色，不代表真实双人授权。发布后禁止修改，创建批次后可执行投放。硬预算不足时停止发券，其他指标只作规则预警。"
            />
            <p>
              目标行为是观察期内的关联事实，不解释为营销因果效果。领取后预占预算，核销实扣，到期或取消释放。
            </p>
          </div>
        </Form>
      </Modal>
      <Modal
        open={!!detail}
        title="数据与配置"
        width={850}
        footer={null}
        onCancel={() => setDetail(undefined)}
      >
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(detail, null, 2)}</pre>
      </Modal>
      <Modal
        open={!!execute}
        title={`执行模拟投放 · 批次 ${execute?.id}`}
        width={800}
        footer={null}
        onCancel={() => setExecute(undefined)}
      >
        <Alert message="每一步都会写入数据库；目标行为须在核销后单独记录，不由核销自动推断。" />
        <p>从冻结快照选择客户（首 50 人），或输入快照内任意 SYN 编号。</p>
        <Select
          showSearch
          style={{ width: 250 }}
          options={members.map((m) => ({ label: m.customer_id, value: m.customer_id }))}
          value={user || undefined}
          onChange={setUser}
        />
        <Input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{ width: 220, marginLeft: 8 }}
          placeholder="SYN00001"
        />
        <p>领取权益绑定的商户</p>
        <Select
          style={{ width: 300 }}
          value={merchant}
          options={
            execute
              ? options(
                  parse(
                    versions.find((v) => v.id === execute.campaign_version_id)?.config_json || '{}',
                  ).merchants || [],
                )
              : []
          }
          onChange={setMerchant}
        />
        <Space wrap style={{ marginTop: 20 }}>
          <Button disabled={!user} onClick={() => stage('DELIVERED')}>
            1. 记录有效触达
          </Button>
          <Button disabled={!user} onClick={() => stage('PARTICIPATED')}>
            2. 记录参与
          </Button>
          <Button
            disabled={!user || !merchant}
            onClick={() =>
              perform(async () =>
                setResult(
                  await api(`/runs/${execute.id}/claim`, 'POST', {
                    customer_id: user,
                    merchant_id: merchant,
                  }),
                ),
              )
            }
          >
            3. 领取并预占预算
          </Button>
          <Button disabled={!user} onClick={() => stage('TARGET_ACTION_COMPLETED')}>
            5. 记录目标行为
          </Button>
        </Space>
        {result && (
          <Card title="领取成功">
            <p>
              模拟权益码：<strong>{result.code}</strong>
            </p>
            <Link to="/operating/merchants">4. 前往商户页核销</Link>
            <p>
              <a href={`/wallet?customer=${user}`}>查看消费者权益钱包</a>
            </p>
          </Card>
        )}
      </Modal>
    </Shell>
  );
}
