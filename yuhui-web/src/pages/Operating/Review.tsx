import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Modal,
  Input,
  Tooltip,
  Progress,
} from 'antd';
import { api, Shell, perform, money, percent, RawTable } from './shared';
const stages: Record<string, string> = {
  SNAPSHOT: '客群快照',
  DELIVERED: '有效触达',
  PARTICIPATED: '参与',
  CLAIMED: '领取',
  REDEEMED: '核销',
  TARGET_ACTION_COMPLETED: '目标行为',
};
export default function Review() {
  const [runs, setRuns] = useState<any[]>([]),
    [id, setId] = useState<number>(),
    [data, setData] = useState<any>(),
    [ledger, setLedger] = useState<any>(),
    [decision, setDecision] = useState('KEEP'),
    [reason, setReason] = useState('');
  useEffect(() => {
    perform(async () => {
      const r = await api('/runs');
      setRuns(r);
      setId(Number(new URLSearchParams(location.search).get('run')) || r[0]?.id);
    });
  }, []);
  const load = () => (id ? api(`/runs/${id}/review`).then(setData) : Promise.resolve());
  useEffect(() => {
    perform(load);
  }, [id]);
  const showLedger = (type: string, eventType = '', page = 1) =>
    perform(async () =>
      setLedger({
        type,
        eventType,
        page,
        ...(await api(`/runs/${id}/ledger?type=${type}&eventType=${eventType}&page=${page}`)),
      }),
    );
  return (
    <Shell
      title={data ? `经营复盘｜截至 ${data.review_as_of.replace('T', ' ').slice(0, 16)}` : '经营复盘'}
      subtitle="每个数字都可追溯至冻结客群、投放批次与经营 / 预算流水。观察行为不代表因果增量。"
    >
      <Space style={{ marginBottom: 20 }}>
        <Select
          placeholder="选择投放批次"
          style={{ width: 440 }}
          value={id}
          options={runs.map((r) => ({ value: r.id, label: `#${r.id} ${r.name}` }))}
          onChange={setId}
        />
        <Button onClick={() => perform(load)}>重新计算</Button>
        <Button onClick={() => showLedger('budget')}>预算流水</Button>
        <Button onClick={() => showLedger('event')}>经营事件台账</Button>
      </Space>
      {data && (
        <>
          <Alert
            showIcon
            type={data.fulfillment_status === 'ONGOING' ? 'warning' : 'info'}
            message={data.fulfillment_status === 'ONGOING'
              ? `${data.run.status === 'ENDED' || new Date(data.run_end_at.replace(' ', 'T')).getTime() < Date.now() ? '投放已结束，权益履约仍在进行中。' : '权益履约进行中。'} 当前仍有 ${data.outstanding_entitlement_count} 项权益待履约。`
              : '当前已领取权益履约已完成。'}
            description={`投放窗口：${data.run_start_at} 至 ${data.run_end_at}。停止投放不等于履约结束。`}
            style={{ marginBottom: 20 }}
          />
          <Card title="经营目标达成" style={{ marginBottom: 20 }}>
            <Row gutter={20}>
              <Col span={6}><Statistic title="目标行为客户（实际 / 目标）" value={`${data.target_actual} / ${data.target_value}`} /></Col>
              <Col span={6}><Statistic title="完成率" value={percent(data.target_achievement_rate)} /></Col>
              <Col span={6}><Statistic title="与目标差额" value={`${data.target_delta > 0 ? '+' : ''}${data.target_delta}`} /></Col>
              <Col span={6}><Statistic title="达标状态" value={data.target_met ? '已达标' : '未达标'} /></Col>
            </Row>
            <p>目标定义：{data.target_metric}；目标值来自发布版本。目标行为为合成观察事实，不代表营销因果增量。</p>
            <p>目标行为观察窗口：{data.target_observation_start_at} 至 {data.target_observation_end_at}（含边界）。</p>
          </Card>
          <Card title="客户行为漏斗 · 按客户去重">
            <Row gutter={12}>
              {Object.entries(data.funnel).map(([stage, value]) => (
                <Col span={4} key={stage}>
                  <Tooltip
                    title={
                      stage === 'SNAPSHOT'
                        ? '来源：segment_snapshot_member 冻结成员数'
                        : `来源：Event Ledger / ${stage}，COUNT(DISTINCT customer_id)`
                    }
                  >
                    <Button
                      type="link"
                      onClick={() =>
                        stage === 'SNAPSHOT'
                          ? perform(async () =>
                              setLedger({
                                type: 'snapshot',
                                items: await api(
                                  `/snapshots/${data.run.segment_snapshot_id}/members`,
                                ),
                                total: data.funnel.SNAPSHOT,
                                page: 1,
                              }),
                            )
                          : showLedger('event', stage)
                      }
                    >
                      {stages[stage]}
                    </Button>
                  </Tooltip>
                  <Statistic value={Number(value)} />
                  <Progress
                    percent={
                      data.funnel.SNAPSHOT ? (Number(value) / data.funnel.SNAPSHOT) * 100 : 0
                    }
                    showInfo={false}
                    strokeColor="#a92e35"
                  />
                </Col>
              ))}
            </Row>
            <p>
              目标行为观察窗口：{data.target_observation_start_at} 至 {data.target_observation_end_at}
              。目标行为需要独立记录；核销不会自动推定活跃。
            </p>
          </Card>
          <Card title="预算与成本" style={{ marginTop: 20 }}>
            <p>截至 {data.review_as_of.replace('T', ' ')} 的累计履约事实；核销、实扣与释放包含投放结束后的履约，不按目标观察窗口截断。</p>
            <Row gutter={[20, 20]}>
              {[
                ['总预算', data.budget.total],
                ['当前预占', data.budget.reserved],
                ['已实扣', data.budget.committed],
                ['累计释放', data.budget.released],
                ['可用预算', data.budget.available],
                ['商户让利', data.merchant_contribution],
                ['单位核销客户银行成本', data.cost_per_redeemed_customer],
                ['单位目标行为客户银行成本', data.cost_per_target_action_customer],
              ].map(([title, value]) => (
                <Col span={6} key={title}>
                  <Statistic title={title} value={money(value)} />
                </Col>
              ))}
            </Row>
            <p>
              预算使用率（实扣 / 总预算）：{percent(data.budget.utilization)}
              。累计释放是历史流水合计，不与当前预占重复加总。
            </p>
            <p>成本效率 = 已实扣银行成本 ÷ 对应去重客户数；分母为 0 时显示「—」。</p>
          </Card>
          {data.warnings.map((w: string) => (
            <Alert key={w} type="warning" showIcon message={w} style={{ marginTop: 12 }} />
          ))}
          <Card title="经营拆解" style={{ marginTop: 20 }}>
            <Tabs
              items={Object.entries({
                segment: '客群快照',
                scene: '场景',
                merchant: '商户',
                benefit: '权益',
              }).map(([key, label]) => ({
                key,
                label,
                children: (
                  <Table
                    rowKey="dimension_id"
                    dataSource={data.breakdown[key]}
                    columns={[
                      { title: label, dataIndex: 'name' },
                      { title: '领取客户', dataIndex: 'claimed' },
                      { title: '核销客户', dataIndex: 'redeemed' },
                      {
                        title: '核销率',
                        dataIndex: 'redemption_rate',
                        render: (v) => (
                          <div style={{ minWidth: 100 }}>
                            <Progress
                              size="small"
                              percent={Number(((v || 0) * 100).toFixed(1))}
                              strokeColor="#a92e35"
                            />
                          </div>
                        ),
                      },
                      { title: '目标行为客户', dataIndex: 'target_actions' },
                      { title: '银行成本', dataIndex: 'bank_cost', render: money },
                      { title: '规则建议', dataIndex: 'suggestion' },
                    ]}
                  />
                ),
              }))}
            />
          </Card>
          <Card title="下一轮资源决策 · 人工记录" style={{ marginTop: 20 }}>
            <p>规则提示提供判断依据，最终由运营人员选择。保存时冻结当前指标。</p>
            {data.fulfillment_status === 'ONGOING' && <Alert type="warning" message="当前权益履约尚未全部结束，本决策基于截至当前时间的经营事实。" style={{ marginBottom: 16 }} />}
            <Space>
              <Select
                value={decision}
                onChange={setDecision}
                style={{ width: 160 }}
                options={[
                  { value: 'EXPAND', label: '扩大' },
                  { value: 'KEEP', label: '保持' },
                  { value: 'REDUCE', label: '减少' },
                  { value: 'STOP', label: '停止' },
                ]}
              />
              <Button
                disabled={data.run.status !== 'ENDED' || !reason.trim()}
                type="primary"
                onClick={() =>
                  perform(
                    () => api(`/runs/${id}/decisions`, 'POST', { decision_type: decision, reason }),
                    load,
                  )
                }
              >
                保存决策与指标快照
              </Button>
            </Space>
            <Input.TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="根据哪些事实，下一轮如何调整资源？"
              maxLength={3000}
              rows={3}
              style={{ margin: '16px 0' }}
            />
            {data.run.status !== 'ENDED' && (
              <Alert message="请先在活动经营中结束批次，再保存复盘决策。" />
            )}
            <RawTable
              rows={data.decisions}
              columns={[
                { title: '决策', dataIndex: 'decision_type' },
                { title: '原因', dataIndex: 'reason' },
                { title: '记录时间', dataIndex: 'created_at' },
                {
                  title: '事实快照',
                  dataIndex: 'metrics_snapshot_json',
                  render: (v: any) => (
                    <Button
                      onClick={() =>
                        Modal.info({
                          title: '决策时的指标快照',
                          width: 900,
                          content: (
                            <pre style={{ maxHeight: 500, overflow: 'auto' }}>
                              {JSON.stringify(JSON.parse(v), null, 2)}
                            </pre>
                          ),
                        })
                      }
                    >
                      查看
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
      <Modal
        open={!!ledger}
        title="事实明细"
        width={1100}
        footer={null}
        onCancel={() => setLedger(undefined)}
      >
        <p>金额单位：分。事件以业务语义键幂等；目标行为不代表因果效果。</p>
        <Table
          rowKey={(r: any) => String(r.id ?? r.customer_id)}
          dataSource={ledger?.items || []}
          scroll={{ x: true }}
          columns={Object.keys(ledger?.items?.[0] || {}).map((key) => ({
            title: key,
            dataIndex: key,
            render: (v: any) => (
              <span style={{ wordBreak: 'break-all' }}>
                {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}
              </span>
            ),
          }))}
          pagination={{
            total: ledger?.total,
            pageSize: ledger?.type === 'snapshot' ? 50 : 100,
            current: ledger?.page,
            onChange: (p) =>
              ledger.type === 'snapshot'
                ? perform(async () =>
                    setLedger({
                      ...ledger,
                      page: p,
                      items: await api(
                        `/snapshots/${data.run.segment_snapshot_id}/members?page=${p}`,
                      ),
                    }),
                  )
                : showLedger(ledger.type, ledger.eventType, p),
          }}
        />
      </Modal>
    </Shell>
  );
}
