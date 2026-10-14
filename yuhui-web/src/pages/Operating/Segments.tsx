import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Table, Tabs, Modal, Alert } from 'antd';
import { api, Shell, perform, parse, labels, RawTable } from './shared';
const fields = [
  'district',
  'asset_tier',
  'lifecycle_stage',
  'last_active_days',
  'activity_level_30d',
  'points_balance',
  'expiring_points',
  'preferred_scene',
  'preferred_benefit_type',
  'marketing_consent',
];
const fieldNames = [
  '地区',
  '资产层级（Demo）',
  '生命周期',
  '距活跃天数（基准日）',
  '近30日活跃次数',
  '积分余额',
  '即将到期积分',
  '偏好场景',
  '偏好权益',
  '营销许可',
];
export default function Segments() {
  const [segments, setSegments] = useState<any[]>([]),
    [snapshots, setSnapshots] = useState<any[]>([]),
    [customers, setCustomers] = useState<any>({ items: [], total: 0 }),
    [editing, setEditing] = useState<any>(),
    [opened, setOpened] = useState(false),
    [preview, setPreview] = useState<any>(),
    [members, setMembers] = useState<any>(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const load = () =>
    Promise.all([api('/segments').then(setSegments), api('/snapshots').then(setSnapshots)]);
  useEffect(() => {
    perform(load);
  }, []);
  useEffect(() => {
    perform(() =>
      api(`/customers?page=${page}&search=${encodeURIComponent(search)}`).then(setCustomers),
    );
  }, [page, search]);
  const rule = () => {
    const v = form.getFieldsValue();
    return {
      logic: v.logic,
      conditions: (v.conditions || []).map((r: any) => ({
        ...r,
        value:
          r.field === 'marketing_consent'
            ? r.value === 'true' || r.value === true
            : [
                'last_active_days',
                'activity_level_30d',
                'points_balance',
                'expiring_points',
              ].includes(r.field)
            ? Number(r.value)
            : r.value,
      })),
    };
  };
  const edit = (r?: any) => {
    setEditing(r);
    setPreview(undefined);
    setOpened(true);
    form.setFieldsValue({
      name: r?.name || '',
      logic: 'AND',
      conditions: [{ field: 'last_active_days', op: '>=', value: 60 }],
      ...(r ? parse(r.rule_json) : {}),
    });
  };
  return (
    <Shell
      title="客群经营"
      subtitle="轻量规则筛选；冻结快照自动排除未许可营销的客户。积分折合仅作 Demo：100 积分 = 1 元。"
    >
      <Tabs
        items={[
          {
            key: 'segments',
            label: '客群库与规则',
            children: (
              <>
                <Button type="primary" onClick={() => edit()}>
                  创建客群规则
                </Button>
                <Table
                  rowKey="id"
                  dataSource={segments}
                  columns={[
                    { title: '客群', dataIndex: 'name' },
                    {
                      title: '规则',
                      dataIndex: 'rule_json',
                      render: (v) => <code>{JSON.stringify(parse(v))}</code>,
                    },
                    {
                      title: '操作',
                      render: (_, r) => (
                        <Space>
                          <Button onClick={() => edit(r)}>编辑 / 预览</Button>
                          <Button
                            onClick={() =>
                              perform(() => api(`/segments/${r.id}/snapshots`, 'POST'), load)
                            }
                          >
                            冻结快照
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            key: 'snapshots',
            label: '不可变快照',
            children: (
              <RawTable
                rows={snapshots}
                columns={[
                  { title: '编号', dataIndex: 'id' },
                  { title: '快照', dataIndex: 'snapshot_name' },
                  { title: '人数', dataIndex: 'customer_count' },
                  { title: '数据版本', dataIndex: 'source_version' },
                  { title: '创建时间', dataIndex: 'created_at' },
                  {
                    title: '成员',
                    render: (_: any, r: any) => (
                      <Button
                        onClick={() =>
                          perform(async () =>
                            setMembers({
                              id: r.id,
                              count: r.customer_count,
                              rows: await api(`/snapshots/${r.id}/members`),
                            }),
                          )
                        }
                      >
                        查看冻结成员
                      </Button>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'customers',
            label: '合成客户',
            children: (
              <>
                <Input.Search
                  placeholder="按 SYN 客户编号搜索"
                  onSearch={(v) => {
                    setSearch(v);
                    setPage(1);
                  }}
                  style={{ maxWidth: 320, marginBottom: 16 }}
                />
                <Table
                  rowKey="customer_id"
                  dataSource={customers.items}
                  scroll={{ x: true }}
                  pagination={{
                    total: customers.total,
                    pageSize: 50,
                    current: page,
                    onChange: setPage,
                  }}
                  columns={[
                    { title: '客户编号', dataIndex: 'customer_id' },
                    { title: '地区', dataIndex: 'district' },
                    { title: '生命周期', dataIndex: 'lifecycle_stage', render: (v) => labels[v] },
                    { title: '层级', dataIndex: 'asset_tier' },
                    { title: '未活跃天数', dataIndex: 'last_active_days' },
                    { title: '积分', dataIndex: 'points_balance' },
                    { title: '偏好场景', dataIndex: 'preferred_scene', render: (v) => labels[v] },
                    {
                      title: '营销许可',
                      dataIndex: 'marketing_consent',
                      render: (v) => (v ? '已许可' : '未许可'),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑客群规则' : '创建客群规则'}
        open={opened}
        width={850}
        onCancel={() => setOpened(false)}
        onOk={() =>
          perform(async () => {
            await form.validateFields();
            await api(editing ? `/segments/${editing.id}` : '/segments', editing ? 'PUT' : 'POST', {
              name: form.getFieldValue('name'),
              rule: rule(),
            });
            setOpened(false);
          }, load)
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="客群名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logic" label="条件组合">
            <Select options={['AND', 'OR'].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.List name="conditions">
            {(items, { add, remove }) => (
              <>
                {items.map((f) => (
                  <Space key={f.key} align="baseline">
                    <Form.Item name={[f.name, 'field']} rules={[{ required: true }]}>
                      <Select
                        style={{ width: 180 }}
                        options={fields.map((value, i) => ({ value, label: fieldNames[i] }))}
                      />
                    </Form.Item>
                    <Form.Item name={[f.name, 'op']}>
                      <Select
                        style={{ width: 70 }}
                        options={['=', '>=', '<=', '>', '<', '!='].map((value) => ({
                          value,
                          label: value,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item name={[f.name, 'value']} rules={[{ required: true }]}>
                      <Input placeholder="枚举值或数字；许可用 true/false" style={{ width: 260 }} />
                    </Form.Item>
                    <Button onClick={() => remove(f.name)}>移除</Button>
                  </Space>
                ))}
                <Button
                  onClick={() => add({ field: 'preferred_scene', op: '=', value: 'COMMUNITY' })}
                >
                  增加条件
                </Button>
              </>
            )}
          </Form.List>
          <p>
            生命周期：NEW / ACTIVE / AT_RISK / DORMANT；场景：COMMUNITY / DINING / CULTURE_TOURISM /
            LOCAL_SPECIALTY。
          </p>
        </Form>
        <Button
          onClick={() =>
            perform(async () => setPreview(await api('/segments/preview', 'POST', rule())))
          }
        >
          预览匹配人数
        </Button>
        {preview && (
          <Card
            style={{ marginTop: 16 }}
            title={`匹配 ${preview.count} 人 · 可触达 ${preview.consented_count} 人`}
          >
            <RawTable rows={preview.distribution} />
          </Card>
        )}
      </Modal>
      <Modal
        open={!!members}
        title="冻结成员与当时属性"
        width={1000}
        footer={null}
        onCancel={() => setMembers(undefined)}
      >
        <Alert message="后续客户属性变化不改变此成员集合。" />
        <Table
          rowKey="customer_id"
          dataSource={members?.rows}
          columns={[
            { title: '客户', dataIndex: 'customer_id' },
            {
              title: '冻结属性',
              dataIndex: 'frozen_attributes_json',
              render: (v) => <code>{v}</code>,
            },
          ]}
          pagination={{
            total: members?.count,
            pageSize: 50,
            onChange: (p) =>
              perform(async () =>
                setMembers({
                  ...members,
                  rows: await api(`/snapshots/${members.id}/members?page=${p}`),
                }),
              ),
          }}
        />
      </Modal>
    </Shell>
  );
}
