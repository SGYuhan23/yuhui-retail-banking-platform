import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Table, Space } from 'antd';
import { Link } from '@umijs/max';
import { api, Shell, perform, money, percent } from './shared';
const fieldLabels: Record<string, string> = {
  id: '流水编号',
  campaign_run_id: '批次',
  customer_id: '合成客户',
  benefit_id: '权益编号',
  operation_type: '操作',
  reserved_delta: '预占变化（分）',
  committed_delta: '实扣变化（分）',
  bank_amount: '银行金额（分）',
  business_ref_id: '业务引用',
  idempotency_key: '幂等键',
  created_at: '发生时间',
};
export default function Budget() {
  const [rows, setRows] = useState<any[]>([]),
    [ledger, setLedger] = useState<any>();
  const load = () => api('/overview').then((d) => setRows(d.runs));
  useEffect(() => {
    perform(load);
  }, []);
  const inspect = (id: number, page = 1) =>
    perform(async () =>
      setLedger({ id, page, ...(await api(`/runs/${id}/ledger?type=budget&page=${page}`)) }),
    );
  return (
    <Shell
      title="积分与预算"
      subtitle="预算预占、实扣、释放均来自流水；旧积分账户通过左侧二级菜单查看。"
    >
      <Space>
        <Button onClick={() => perform(load)}>重新计算预算</Button>
        <Button onClick={() => perform(() => api('/expire', 'POST'), load)}>释放到期预占</Button>
      </Space>
      <Card title="活动预算池" style={{ marginTop: 20 }}>
        <Table
          rowKey="id"
          dataSource={rows}
          scroll={{ x: 900 }}
          columns={[
            { title: '批次 / 活动', render: (_: any, r: any) => `#${r.id} ${r.name}` },
            ...['total', 'reserved', 'committed', 'released', 'available'].map((k, i) => ({
              title: ['总预算', '当前预占', '已实扣', '累计释放', '可用预算'][i],
              render: (_: any, r: any) => money(r.budget[k]),
            })),
            { title: '实扣使用率', render: (_: any, r: any) => percent(r.budget.utilization) },
            {
              title: '查看',
              render: (_: any, r: any) => (
                <Space>
                  <Button onClick={() => inspect(r.id)}>流水</Button>
                  <Link to={`/operating/review?run=${r.id}`}>复盘</Link>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="预算流水"
        open={!!ledger}
        width={1100}
        footer={null}
        onCancel={() => setLedger(undefined)}
      >
        <Table
          rowKey="id"
          dataSource={ledger?.items || []}
          scroll={{ x: 1500 }}
          columns={Object.keys(fieldLabels).map((k) => ({ title: fieldLabels[k], dataIndex: k }))}
          pagination={{
            total: ledger?.total,
            current: ledger?.page,
            pageSize: 100,
            showSizeChanger: false,
            onChange: (p) => inspect(ledger.id, p),
          }}
        />
      </Modal>
    </Shell>
  );
}
