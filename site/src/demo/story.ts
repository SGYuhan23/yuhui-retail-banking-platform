import { fixtures as f } from './fixtures';
export const storySteps = [
  { key: 'segments', label: '选客户', title: '这次优惠，发给哪些人？', task: '从合成客户中，确认这次活动的筛选条件。', result: '发布时保存本次名单，后续规则变化不会改变已发布名单。' },
  { key: 'campaign', label: '定方案', title: '给客户什么优惠，钱由谁出？', task: '确认一张券的使用条件、成本分担和活动预算。', result: '把客群、权益、预算和目标一起提交审核。' },
  { key: 'review', label: '审方案', title: '审核过的方案，执行时不能变。', task: '核对方案；也可以试一次“审核后修改规则”的异常分支。', result: '只有当前配置与已审核内容一致，才能发布。' },
  { key: 'wallet', label: '领优惠', title: '客户领了券，预算先留出来。', task: '切换到一名合成客户的视角，领取这张社区生活券。', result: '银行先预留每张券的成本，客户尚未使用时不计实际成本。' },
  { key: 'redemption', label: '用优惠', title: '券真正用掉，才计入这次活动的成本。', task: '切换到商户视角，确认这名客户使用优惠券。', result: '同一笔银行成本由预占转为实扣，重复确认不会重复扣减。' },
  { key: 'fulfillment', label: '收尾', title: '不再发券以后，还要处理已发出去的券。', task: '结束单人体验，查看整个固定案例的后续履约结果。', result: '已使用的券计入成本，未使用到期的券释放预算。' },
  { key: 'final-review', label: '做判断', title: '钱花在哪里，下一轮怎么调整？', task: '看完整案例的成本和商户差异，再留下你的决定及理由。', result: '把决定与当时的数据一起保存，便于之后回看依据。' },
] as const;
export const ruleNotes = [
  '活动限定在涪陵社区生活场景。',
  '本案例把距上次活跃 60–180 天的人作为经营对象。',
  '本次预设的客群条件；领取这张券不扣积分。',
  '让本次权益场景与客户已有偏好相符。',
  '没有营销许可的客户不进入本次经营名单。',
];
export const r = f.review;
export const unused = r.funnel.CLAIMED - r.funnel.REDEEMED;
export const rate = (n: number, d: number) => d ? `${(n / d * 100).toFixed(1)}%` : '—';
export const fmt = (n: number) => n.toLocaleString('zh-CN');
export const caseTitle = '6000 元社区生活优惠，怎样发得清楚、管得住？';
