import { fixtures as f } from './fixtures';
export const storySteps = [
  { key: 'segments', label: '目标客群', title: '目标客群', task: '筛选一段时间未活跃、偏好社区生活的客户。' },
  { key: 'campaign', label: '活动方案', title: '活动方案', task: '确定优惠条件、合作商户和银行预算。' },
  { key: 'review', label: '审核发布', title: '审核发布', task: '核对客群与预算，发布已审核的方案。' },
  { key: 'wallet', label: '客户领券', title: '客户领券', task: '领取一张优惠券，查看银行预算变化。' },
  { key: 'redemption', label: '商户核销', title: '商户核销', task: '确认优惠券已使用，将预留预算计入成本。' },
  { key: 'fulfillment', label: '活动结算', title: '活动结算', task: '处理整场活动的已用券和到期未用券。' },
  { key: 'final-review', label: '经营复盘', title: '经营复盘', task: '查看成本与商户表现，记录下一轮安排。' },
] as const;
export const r = f.review;
export const unused = r.funnel.CLAIMED - r.funnel.REDEEMED;
export const rate = (n: number, d: number) => d ? `${(n / d * 100).toFixed(1)}%` : '—';
export const fmt = (n: number) => n.toLocaleString('zh-CN');
export const amount = (fen: number) => `¥${(fen / 100).toLocaleString('zh-CN', {maximumFractionDigits: 2})}`;
export const merchantName = (name: string) => name.replace('（虚构）','');
