import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import { fixtures as f, asset, source } from '../demo/fixtures';
import { amount, fmt } from '../demo/story';

export function PublicHeader() {
  return <header className="public-header">
    <Link className="brand" to="/"><img src={asset('bank-mark.svg')} alt="" /><span>渝惠<small>零售客户经营与场景权益平台</small></span></Link>
    <nav aria-label="主导航"><span className="data-badge">模拟数据</span><Link to="/">首页</Link><Link to="/demo/segments">工作台</Link></nav>
  </header>;
}
export function PublicFooter() {
  return <footer className="public-footer"><details><summary>数据与演示说明</summary><p>个人项目。客户、商户及交易均为合成数据，采用完整系统同一组案例记录。页面交互在浏览器中运行，不连接银行或支付系统。</p><p>客户行为按预设规则生成，用于展示业务流程，不代表真实营销业绩。直接查看各步骤会载入对应阶段；完整体验按操作顺序推进。</p></details><a href={source} target="_blank" rel="noreferrer">项目仓库 ↗</a></footer>;
}
export function Offer() {
  return <div className="offer"><span className="coupon-name">社区生活券</span><div className="offer-face"><span>满 {f.benefit.minSpend / 100} 元</span><strong>减 {f.benefit.face / 100} 元</strong></div><div className="offer-split"><div><small>银行承担</small><strong>{amount(f.benefit.bankCost)}</strong></div><div><small>商户承担</small><strong>{amount(f.benefit.merchantCost)}</strong></div></div><p>领取后 {f.benefit.days} 天有效 · 领取不扣积分</p></div>;
}
export default function Landing() {
  return <><PublicHeader /><main className="landing compact-home">
    <section className="hero">
      <div><h1>银行权益<br /><em>活动管理</em></h1><p className="lead">供零售经营人员筛选客户、审核发券、核算成本，并根据商户表现调整下一轮投放。</p><div className="actions"><Link className="button primary" to="/demo/segments?mode=flow">体验完整流程 <ArrowRightOutlined /></Link><Link className="button" to="/demo/final-review">查看经营复盘</Link></div></div>
      <section className="hero-case"><h2>涪陵社区生活优惠</h2><p>邀请 60–180 天未活跃、偏好社区生活的客户使用优惠。</p><div className="case-facts"><div><span>银行预算</span><strong>{amount(f.campaign.budget)}</strong></div><div><span>符合条件客户</span><strong>{fmt(f.segment.count)} 人</strong></div></div><Offer /></section>
    </section>
    <section className="budget-principle"><div><h2>领券后，预算怎么处理？</h2><p>每张券先预留银行承担的 {amount(f.benefit.bankCost)}，再按使用情况处理。</p><Link className="text-link" to="/demo/wallet">查看领券过程 <ArrowRightOutlined /></Link></div><div className="budget-branches"><article><span>客户使用</span><strong>计入成本 {amount(f.benefit.bankCost)}</strong></article><article><span>到期未使用</span><strong>释放预留 {amount(f.benefit.bankCost)}</strong></article></div></section>
  </main><PublicFooter /></>;
}
