import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons';
import { fixtures as f, money, asset, source } from '../demo/fixtures';
import { storySteps, r, unused, fmt } from '../demo/story';

export function PublicHeader() {
  return <header className="public-header">
    <Link className="brand" to="/"><img src={asset('bank-mark.svg')} alt="" /><span>渝惠<small>零售客户经营与场景权益平台</small></span></Link>
    <nav aria-label="主导航"><Link to="/">了解案例</Link><Link to="/demo/segments">进入活动</Link></nav>
  </header>;
}
export function PublicFooter() {
  return <footer className="public-footer"><div><strong>渝惠 · 个人产品实践</strong><p>展示采用完整系统的固定合成案例；交互在当前浏览器运行，不连接真实银行，也不产生真实交易。</p></div><a href={source} target="_blank" rel="noreferrer">项目仓库 ↗</a></footer>;
}
export function Offer() {
  return <div className="offer"><span className="eyebrow">社区生活券 · 领取后 {f.benefit.days} 天有效</span><div className="offer-face"><span>满 {f.benefit.minSpend / 100} 元</span><strong>减 {f.benefit.face / 100} 元</strong></div><div className="offer-split"><div><small>银行承担</small><strong>{money(f.benefit.bankCost)}</strong></div><div><small>商户承担</small><strong>{money(f.benefit.merchantCost)}</strong></div></div><p>客户在适用商户使用优惠。领取不扣积分，费用按使用结果计算。</p></div>;
}
export default function Landing() {
  return <><PublicHeader /><main className="landing">
    <section className="hero">
      <div><span className="pill"><span className="status-dot" /> 固定合成案例 · 无需登录</span><p className="eyebrow hero-label">从一次具体的银行权益活动说起</p><h1>给客户一份优惠，<br />把每一笔预算<br /><em>管到最后。</em></h1><p className="lead">渝惠帮助经营人员选客户、定优惠、审核发放，并跟踪优惠券使用和活动成本，最后决定下一轮如何调整。</p><div className="actions"><Link className="button primary" to="/demo/segments">开始这次活动 <ArrowRightOutlined /></Link><Link className="button" to="/demo/final-review">先看案例结果</Link></div><p className="quiet">不需要安装项目。下面先看背景，再亲手走一遍。</p></div>
      <div className="hero-case"><div className="case-ribbon"><span>本次任务</span><span>涪陵 · 社区生活</span></div><h2>拿出 {money(f.campaign.budget)}，<br />邀请沉默客户使用社区优惠。</h2><p>面向较长时间未活跃、偏好社区生活且具有营销许可的客户，安排一次权益活动。</p><Offer /><div className="case-note"><CheckOutlined /> 选谁、给什么、花多少、结果怎样，都在同一条流程里。</div></div>
    </section>
    <section className="brief-section"><div className="section-heading"><div><span className="eyebrow">先理解问题，再开始操作</span><h2>这次活动有三个需要作出的判断。</h2></div></div><div className="questions"><article><span>01 / 发给谁</span><h3>有预算，也不能人人都发。</h3><p>从 {fmt(f.customerCount)} 名合成客户中，按地区、活跃间隔、积分、场景偏好和营销许可确定范围。</p></article><article><span>02 / 怎么管钱</span><h3>领了券，不等于已经花钱。</h3><p>领取先预留银行承担的 {money(f.benefit.bankCost)}；使用后计入成本，未使用到期则释放预算。</p></article><article><span>03 / 下一轮怎么办</span><h3>同样的券，各商户表现不同。</h3><p>看客户是否真正使用、银行承担了多少成本，再决定下一轮保持、扩大、缩减或停止。</p></article></div></section>
    <section className="story-section"><div className="section-heading"><div><span className="eyebrow">你来扮演活动经营人员</span><h2>从选人，到留下下一轮决定。</h2><p>每一步都有明确的任务、操作和结果；客户与商户视角会在需要时切换。</p></div></div><div className="story-map">{storySteps.map((s,i)=><Link to={'/demo/'+s.key} key={s.key}><span className="step-number">{String(i+1).padStart(2,'0')}</span><div><h3>{s.label}</h3><p>{s.title}</p></div><ArrowRightOutlined /></Link>)}</div></section>
    <section className="result-teaser"><div><span className="eyebrow">固定案例最终结果</span><h2>{fmt(r.funnel.CLAIMED)} 人领券，<br />{fmt(r.funnel.REDEEMED)} 人实际使用。</h2><p>另外 {unused} 份券未使用到期。银行最终承担 {money(r.budget.committed)}，释放 {money(r.budget.released)} 预占预算。</p><p>这些数字用于展示规则如何执行，不是实际营销业绩，也不能证明客户已恢复长期活跃。</p><Link className="button primary" to="/demo/final-review">看看钱花在哪里 <ArrowRightOutlined /></Link></div><div className="money-summary"><div className="money-bar" aria-label="预算结果：55%形成成本，45%释放"><span style={{width:`${r.budget.committed/r.budget.total*100}%`}} /><span /></div><div><span><i className="dot red" /> 银行实际成本</span><strong>{money(r.budget.committed)}</strong></div><div><span><i className="dot sand" /> 到期释放预算</span><strong>{money(r.budget.released)}</strong></div><div className="sum-line"><span>最初预算</span><strong>{money(r.budget.total)}</strong></div><p>释放的预算不计成本；商户承担的 {money(r.merchant_contribution)} 单独统计。</p></div></section>
  </main><PublicFooter /></>;
}
