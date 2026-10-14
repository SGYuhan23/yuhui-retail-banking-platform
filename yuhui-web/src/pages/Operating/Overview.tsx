import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Row, Space, Statistic, Table } from 'antd';
import { Link } from '@umijs/max';
import { api, Shell, money, labels, perform } from './shared';
export default function Overview() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');
  const load = () =>
    api('/overview')
      .then((result) => {
        setData(result);
        setError('');
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  return (
    <Shell title="经营总览" subtitle="从客群选择到预算执行，沿着同一条经营事实链工作。">
      {error && <Alert type="error" message={error} />}
      <Space style={{ marginBottom: 20 }}>
        <Link to="/operating/campaigns">
          <Button type="primary">制定经营方案</Button>
        </Link>
        <Link to="/operating/review">
          <Button>查看活动复盘</Button>
        </Link>
        <Button onClick={load}>刷新</Button>
        <Button onClick={() => perform(() => api('/expire', 'POST'), load)}>
          释放已到期权益预算
        </Button>
      </Space>
      <Row gutter={16}>
        {[
          ['进行中活动', data?.runs.filter((r: any) => r.status === 'RUNNING').length],
          ['待复核活动', data?.pending.length],
          ['待复盘批次', data?.needs_review.length],
        ].map(([title, value]) => (
          <Col key={title} span={8}>
            <Card>
              <Statistic title={title} value={value ?? 0} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="投放批次与预算" style={{ marginTop: 24 }}>
        <Table
          rowKey="id"
          dataSource={data?.runs || []}
          columns={[
            { title: '活动', dataIndex: 'name' },
            { title: '状态', dataIndex: 'status', render: (v) => labels[v] },
            { title: '总预算', render: (_, r: any) => money(r.budget.total) },
            { title: '已预占', render: (_, r: any) => money(r.budget.reserved) },
            { title: '已实扣', render: (_, r: any) => money(r.budget.committed) },
            { title: '预警', render: (_, r: any) => r.warnings.join('；') || '暂无' },
            {
              title: '操作',
              render: (_, r: any) => <Link to={`/operating/review?run=${r.id}`}>进入复盘</Link>,
            },
          ]}
        />
      </Card>
      <Card title="待办" style={{ marginTop: 20 }}>
        {data?.pending.map((r: any) => (
          <p key={r.id}>待复核：{r.name}</p>
        ))}
        {data?.needs_review.map((r: any) => (
          <p key={r.id}>待决策：{r.name}</p>
        ))}
      </Card>
    </Shell>
  );
}
