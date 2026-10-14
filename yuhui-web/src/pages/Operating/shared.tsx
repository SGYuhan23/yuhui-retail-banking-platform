import './operating.less';
import React from 'react';
import { Alert, message, Table, Typography } from 'antd';
import { request } from '@umijs/max';
export const notice =
  '以下客户、商户、交易与经营结果均为固定种子生成的合成演示数据，不代表任何银行真实经营数据。';
export async function api(path: string, method = 'GET', data?: any): Promise<any> {
  const result = await request(`/api/v1/v3${path}`, { method, data, skipErrorHandler: true });
  if (result.code !== 1000) throw new Error(result.message || '操作失败');
  return result.data;
}
export async function perform(action: () => Promise<any>, reload?: () => void) {
  try {
    const result = await action();
    reload?.();
    return result;
  } catch (e) {
    message.error((e as Error).message);
    return undefined;
  }
}
export const money = (v: any) =>
  v === null || v === undefined ? '—' : `¥${(Number(v) / 100).toFixed(2)}`;
export const percent = (v: any) =>
  v === null || v === undefined ? '—' : `${(Number(v) * 100).toFixed(1)}%`;
export const parse = (v: any) => (typeof v === 'string' ? JSON.parse(v) : v);
export const labels: Record<string, string> = {
  NEW: '新客',
  ACTIVE: '活跃',
  AT_RISK: '待唤醒',
  DORMANT: '沉默',
  DRAFT: '待编辑',
  PENDING_REVIEW: '待复核',
  APPROVED: '已通过',
  PUBLISHED: '已发布',
  RUNNING: '进行中',
  ENDED: '已结束',
  AVAILABLE: '待使用',
  REDEEMED: '已核销',
  EXPIRED: '已到期',
  CANCELLED: '已取消',
  CUSTOMER_REACTIVATION: '客户唤醒',
  MERCHANT_TRAFFIC: '商户引流',
  POINTS_BURN: '积分消耗',
  COUPON: '生活优惠券',
  POINTS_EXCHANGE: '积分兑换',
  DRAW_REWARD: '抽奖权益',
  COMMUNITY: '社区生活',
  DINING: '餐饮消费',
  CULTURE_TOURISM: '山城文旅',
  LOCAL_SPECIALTY: '乡村 / 重庆特色消费',
};
export const options = (items: any[], key = 'id', label = 'name') =>
  items.map((i) => ({ value: i[key], label: i[label] }));
export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="operating-shell"
      style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 8px 48px' }}
    >
      <Typography.Title level={2}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>
      <Alert
        message="Synthetic / Mock Data · 个人产品实践"
        description={notice}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      {children}
    </div>
  );
}
export function RawTable({ rows, columns }: { rows: any[]; columns?: any[] }) {
  const cols =
    columns ||
    Object.keys(rows[0] || {}).map((k) => ({
      title: k,
      dataIndex: k,
      render: (v: any) => (typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')),
    }));
  return (
    <Table
      rowKey={(r) => String(r.id ?? r.customer_id ?? r.dimension_id)}
      dataSource={rows}
      columns={cols}
      size="small"
      scroll={{ x: true }}
      pagination={{ pageSize: 10 }}
    />
  );
}
