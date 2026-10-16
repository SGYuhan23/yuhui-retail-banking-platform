import { useEffect, useReducer, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { fixtures as f, money } from '../demo/fixtures';
import { storySteps, ruleNotes, r, unused, rate, fmt } from '../demo/story';
import { budget, initialState, loadState, reducer, storageKey } from '../demo/reducer';
import { Offer, PublicHeader, PublicFooter } from './Landing';

function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return <section className={'panel ' + className}>{title && <h2>{title}</h2>}{children}</section>;
}
function MoneyView({ values, title }: { values: ReturnType<typeof budget>; title: string }) {
  return <div className="budget-view"><span className="eyebrow">{title}</span><div className="budget-grid">{([
    ['available', '当前可用预算', '总预算减去预占和实扣'], ['reserved', '已预留，尚未花掉', '客户已领取但还没使用'], ['committed', '已计入银行成本', '客户使用后的银行承担部分'],
  ] as const).map(([key,label,note])=><div key={key}><span>{label}</span><strong>{money(values[key])}</strong><small>{note}</small></div>)}</div></div>;
}
function Terms() {
  return <dl className="terms"><div><dt>发给谁</dt><dd>{f.segment.name} · {fmt(f.segment.count)} 人</dd></div><div><dt>银行总预算</dt><dd>{money(f.campaign.budget)}</dd></div><div><dt>每张券的分担</dt><dd>银行 {money(f.benefit.bankCost)} ＋ 商户 {money(f.benefit.merchantCost)}</dd></div><div><dt>活动观察窗口</dt><dd>{f.campaign.start} 至 {f.campaign.end}</dd></div><div><dt>客户使用期限</dt><dd>领取后 {f.benefit.days} 天</dd></div></dl>;
}
export default function Demo() {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);
  const [choice, setChoice] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const navigate = useNavigate();
  const section = useLocation().pathname.split('/')[2] || 'overview';
  const index = storySteps.findIndex(s => s.key === section);
  const step = storySteps[index];
  const go = (key: string) => navigate('/demo/' + key);
  useEffect(() => { dispatch({ type: 'navigate', value: section, step: Math.max(0,index) }); window.scrollTo(0,0); }, [section,index]);
  useEffect(() => { try { localStorage.setItem(storageKey,JSON.stringify(state)); setStorageWarning(false); } catch { setStorageWarning(true); } }, [state]);
  if (!step) return <Navigate to={section === 'overview' ? '/' : '/demo/segments'} replace />;
  const settled = state.fulfillmentStatus === '履约完成';
  const claimed = state.claimStatus === '已领取';
  const redeemed = state.redemptionStatus === '已核销';
  const funds = budget({ ...state, fulfillmentStatus: '进行中' });
  const selected = choice ?? state.decision;
  const activeReason = reason ?? state.decisionReason;
  const next = (label: string, target: string) => <button className="button primary" onClick={() => go(target)}>{label} <ArrowRightOutlined /></button>;
  const prerequisite = (label: string, target: string) => <div className="feedback info"><p>{label}</p>{next('前往完成',target)}</div>;
  const feedback = state.notice ? <div className={'feedback '+(state.changed?'warning':'success')} role="status">{state.notice}</div> : null;
  let content: ReactNode;

  if (section === 'segments') content = <>
    <div className="population"><div><span>本案例客户库</span><strong>{fmt(f.customerCount)}</strong><small>合成客户</small></div><ArrowRightOutlined /><div><span>同时满足以下全部条件</span><strong>{fmt(f.segment.count)}</strong><small>本次可经营客户</small></div></div>
    <Panel title="这次只选符合这些条件的人"><div className="rule-list">{f.segment.rules.map(([label,value],i)=><div className="rule" key={label}><span className="rule-check"><CheckOutlined /></span><div><small>{label}</small><strong>{value}</strong></div><p>{ruleNotes[i]}</p></div>)}</div><div className="explain"><strong>为什么保留积分条件？</strong><p>它用于限定这次预设的“沉默高积分”客群，不是领取券的兑换门槛。当前案例没有验证 2000 分是否是最优筛选阈值。</p></div></Panel>
    <Panel title="选完以后，名单还会变吗？"><p>审核通过并发布时，系统会保存本次实际经营名单。后续修改筛选规则，不会悄悄把新客户加入已发布活动；客户领取时仍需具有营销许可。</p><p className="quiet">这些条件与人数来自完整系统的固定案例，页面不虚构每个筛选条件分别排除了多少人。</p><div className="actions">{next('使用这批客户，制定优惠方案','campaign')}</div></Panel>
  </>;
  else if (section === 'campaign') content = <>
    <div className="two-column"><Offer /><Panel title="把优惠、预算与客户放在一份方案里"><Terms /><div className="explain"><strong>最多能承诺多少份优惠？</strong><p>{money(f.campaign.budget)} ÷ 每份银行承担 {money(f.benefit.bankCost)} = {f.campaign.budget/f.benefit.bankCost} 份。这是当前成本标准下、没有释放预算时的发放容量。</p></div></Panel></div>
    <Panel title="客户可以去哪里使用？"><p>本活动适用于以下 {r.breakdown.merchant.length} 家虚构社区商户。每名客户领取时绑定一家商户，使用时核对该商户。</p><div className="merchant-tags">{r.breakdown.merchant.map(m=><span key={m.name}>{m.name}</span>)}</div></Panel>
    <Panel title="“唤醒客户”在这个案例里怎么观察？"><p>经营意图是邀请一段时间未活跃的客户使用社区优惠。完整系统另行记录“模拟社区消费”目标事件，预设目标为 {f.campaign.goal} 人；核销不会自动生成这条目标记录。</p><p>这是一项演示统计口径，没有验证客户是否持续活跃，也不把券的使用次数当成真实营销增量。</p><div className="actions">{!state.published ? <button className="button primary" onClick={()=>{dispatch({type:'submit'});go('review');}}>提交方案，进入复核 <ArrowRightOutlined /></button> : next('查看已发布方案','review')}</div></Panel>
  </>;
  else if (section === 'review') content = <>
    {state.reviewStatus === '未提交' && prerequisite('这份方案还没有提交审核。先确认客群、权益和预算。','campaign')}
    <Panel title="先核对这份方案"><span className="pill">{state.campaignStatus}</span><Terms /><div className="explain"><strong>为什么不能审核后再改？</strong><p>审核时同意的是这批客户、这份优惠和这笔预算。发布前要再次核对，避免真正执行的内容已经变化。</p></div>{feedback}
      {state.reviewStatus === '待复核' && <div className="actions"><button className="button primary" onClick={()=>dispatch({type:'approve'})}>确认方案，通过复核 <ArrowRightOutlined /></button></div>}
      {state.reviewStatus === '已通过' && !state.published && <div className="actions"><button className="button primary" onClick={()=>dispatch({type:'publish'})}>发布已审核方案</button><button className="button" onClick={()=>dispatch({type:'change'})}>试一次：审核后修改客群规则</button></div>}
      {state.changed && <div className="config-diff"><div><small>审核时的积分条件</small><strong>积分余额 ≥ 2000</strong></div><ArrowRightOutlined /><div><small>异常分支：拟发布条件</small><strong>取消积分余额限制</strong></div><p>这会改变入选范围。此处仅演示配置变化，不重新生成案例人数；需要重新审核，不能沿用旧审批。</p></div>}
      {state.reviewStatus === '需重新复核' && <button className="button primary" onClick={()=>dispatch({type:'restore'})}>恢复原规则，重新提交审核</button>}
      {state.published && <><div className="feedback success">已发布：本次名单与方案固定下来，可以进入客户领取。</div>{next('切换客户视角，领取优惠','wallet')}</>}
    </Panel><Panel title="增加投放批次，也不能绕过总预算"><p>同一活动下各批次的累计分配必须在 {money(f.campaign.budget)} 的活动预算内。如果设置了更低的硬上限，则按更低上限执行。</p></Panel>
  </>;
  else if (section === 'wallet') content = <>
    {!state.published && prerequisite('客户要先等活动审核发布，才能领取优惠。','review')}
    <div className="two-column"><div><div className="persona">客户视角 · 合成客户 {f.customers[0].id}</div><Offer /><Panel><dl className="terms"><div><dt>绑定商户</dt><dd>{f.merchants[0].name}</dd></div><div><dt>案例领取时间</dt><dd>{f.replay.claimAt}</dd></div><div><dt>有效期至</dt><dd>{f.replay.expiresAt}</dd></div></dl><button className="button primary full" disabled={!state.published || claimed || state.campaignStatus!=='已发布'} onClick={()=>dispatch({type:'claim'})}>{claimed ? '已领取，每个批次每人限领一次' : '领取这张社区生活券'}</button></Panel></div><Panel title="领取后，银行预算怎么变化？"><div className="transaction"><span>尚未花掉</span><strong>{money(f.benefit.bankCost)}</strong><p>银行先把这笔钱留给已领取的优惠券，避免后续发放超出预算。</p></div><MoneyView values={funds} title="当前体验：一名客户" />{feedback}<p className="quiet">单人操作用来说明规则；不会改写完整案例的 {r.funnel.CLAIMED} 次领取结果。</p></Panel></div>{claimed && next('到商户使用这张券','redemption')}
  </>;
  else if (section === 'redemption') content = <>
    {!claimed && prerequisite('这名客户还没有领取优惠券。','wallet')}
    <Panel title="商户确认这张券能不能用"><div className="persona">商户视角 · {f.merchants[0].name}</div><div className="check-grid"><div><CheckOutlined /><strong>商户匹配</strong><p>就是领取时绑定的商户。</p></div><div><CheckOutlined /><strong>消费达到门槛</strong><p>预设模拟消费 {money(f.benefit.minSpend)}，达到满减条件。</p></div><div><CheckOutlined /><strong>仍在有效期内</strong><p>案例使用时间 {f.replay.redeemAt}，早于 {f.replay.expiresAt}。</p></div></div><p>“核销”就是确认优惠券已经使用。这里回放固定案例日期，不产生真实付款。</p><div className="actions"><button className="button primary" disabled={!claimed} onClick={()=>dispatch({type:'redeem'})}>{redeemed ? '再确认一次，检查是否重复扣减' : '确认客户使用优惠券'}</button></div>{feedback}</Panel>
    <Panel title="同一笔钱，从预占转为实际成本"><div className="transfer"><div><small>预占预算</small><strong>−{money(f.benefit.bankCost)}</strong></div><ArrowRightOutlined /><div><small>银行实际成本</small><strong>＋{money(f.benefit.bankCost)}</strong></div></div><p>银行承担 {money(f.benefit.bankCost)}，商户承担 {money(f.benefit.merchantCost)}，合计为客户减免 {money(f.benefit.face)}。这个案例不包含真实支付和商户清结算。</p><MoneyView values={funds} title="当前体验：一名客户" /></Panel>
    {redeemed && <button className="button primary" onClick={()=>{dispatch({type:'end'});go('fulfillment');}}>停止投放，查看整个案例如何收尾 <ArrowRightOutlined /></button>}
  </>;
  else if (section === 'fulfillment') content = <>
    {!redeemed ? prerequisite('先完成一名客户的领取与使用，再推进整个案例。','redemption') : <>
      <div className="feedback info"><strong>现在从“一名客户的操作”，切换到“整个固定案例”。</strong><p>后面的 {r.funnel.CLAIMED} 份权益结果来自完整系统的固定案例，不是把刚才一次点击放大成经营业绩。</p></div>
      <Panel title="停止发券，还不代表所有券都处理完了"><div className="state-pair"><span className="pill">已停止投放</span><span className={'pill '+(settled?'positive':'')}>{settled?'已领取权益全部处理完毕':'继续处理已领取权益'}</span></div><p>活动不再接受新领取，之前发出的券仍按各自的 {f.benefit.days} 天有效期处理。有效期内可以使用；未使用到期则释放银行预占预算。</p><div className="outcome-grid"><article><span>使用优惠券</span><strong>{r.funnel.REDEEMED} 人</strong><p>按每人 {money(f.benefit.bankCost)}，银行成本 {money(r.budget.committed)}。</p></article><article><span>未使用，到期</span><strong>{unused} 份</strong><p>按每份 {money(f.benefit.bankCost)}，释放预算 {money(r.budget.released)}。</p></article></div><p className="quiet">上方是固定案例的最终分支结果；点击下面按钮，推进当前体验至该结果。</p><div className="actions"><button className="button primary" disabled={settled} onClick={()=>{dispatch({type:'end'});dispatch({type:'settle'});}}>{settled?'已推进至固定案例最终结果':'推进到全部权益处理完毕'}</button></div>{feedback}</Panel>{settled && next('查看成本与商户表现，作出下一轮决定','final-review')}
    </>}
  </>;
  else content = <>
    {!settled && <div className="feedback info"><strong>你正在直接查看完整案例的最终结果。</strong><p>数据可以直接阅读。完成前面的体验后，即可保存自己的下一轮决定。</p>{next('从选择客户开始体验','segments')}</div>}
    <Panel className="review-conclusion"><span className="eyebrow">先看结论</span><h2>{r.funnel.CLAIMED} 人领取，{r.funnel.REDEEMED} 人使用；银行成本 {money(r.budget.committed)}。</h2><p>{unused} 份未使用权益到期，释放 {money(r.budget.released)}。所有已领取权益均已处理完毕，当前没有待用券占用预算。</p><p>下一轮值得重点检查的是商户差异，而不是仅凭“目标已达标”就扩大投放。</p></Panel>
    <Panel title="客户从入选到使用，分别走到了哪一步？"><div className="funnel-story">{[
      ['入选客户',r.funnel.SNAPSHOT,'符合固定筛选条件'],['记录触达',r.funnel.DELIVERED,'模拟通知已经送达'],['记录参与',r.funnel.PARTICIPATED,'模拟客户参与了活动'],['领取优惠券',r.funnel.CLAIMED,'本案例发放上限为 500 份'],['实际使用券',r.funnel.REDEEMED,'已使用人数，不代表长期活跃'],
    ].map(([label,value,note])=><div key={label}><span>{label}</span><strong>{fmt(Number(value))}</strong><small>{note}</small></div>)}</div><p className="quiet">均按客户去重。领取人数同时受到固定数据生成规则和发放上限影响，不能把它当作自然转化率。</p></Panel>
    <Panel title="6000 元预算最后去了哪里？"><MoneyView values={r.budget} title="完整固定案例 · 全部权益已处理" /><div className="cost-lines"><div><span>到期释放的预算</span><strong>{money(r.budget.released)}</strong></div><div><span>商户承担（不计入银行预算）</span><strong>{money(r.merchant_contribution)}</strong></div><div><span>每名用券客户的银行成本</span><strong>{money(r.budget.committed/r.funnel.REDEEMED)}</strong></div><div><span>优惠券使用率</span><strong>{rate(r.funnel.REDEEMED,r.funnel.CLAIMED)}</strong></div></div><p>释放是此前预占的钱重新可用，不能再把“累计释放”和“剩余可用”当成两笔余额相加。</p></Panel>
    <Panel title="哪些商户需要进一步了解？"><div className="merchant-chart">{r.breakdown.merchant.map(m=><div className={'merchant-row '+(m.redemption_rate<0.2?'flagged':'')} key={m.name}><strong>{m.name}</strong><div className="merchant-bar"><span style={{width:`${m.redeemed/m.claimed*100}%`}} /></div><span>{m.redeemed} / {m.claimed} 人使用</span><b>{rate(m.redeemed,m.claimed)}</b><span>银行成本 {money(m.bank_cost)}</span></div>)}</div><div className="explain"><strong>{r.breakdown.merchant[0].name}：{r.breakdown.merchant[0].redeemed} / {r.breakdown.merchant[0].claimed} 人使用，低于 20% 提示线。</strong><p>系统提示可考虑减少下一轮额度。经营人员仍应先了解客群是否匹配、使用门槛是否合适、商户是否便于到达，不能只凭低使用率认定商户低效。</p><p className="quiet">本合成案例有意为这家商户设置较低使用概率，以验证规则提示；不是对真实商户的评价。</p></div></Panel>
    <Panel title="另外记录的 224 人，代表什么？"><div className="target-grid"><div><span>单独记录模拟目标事件</span><strong>{r.target_actual} 人</strong></div><div><span>演示预设目标</span><strong>{r.target_value} 人</strong></div><div><span>观察结果 ÷ 预设目标</span><strong>{rate(r.target_actual,r.target_value)}</strong></div></div><p>完整系统在核销之后，另外记录与活动目标匹配的“模拟社区消费”事件。{r.target_actual} 是有这条记录的去重客户数；它不是由核销自动推定，也不能解释为复购或持续活跃。</p><p>目标记录只统计 {f.campaign.start} 至 {f.campaign.end}；券的使用与成本则持续跟踪至履约结束。</p><p>每名目标记录客户的银行成本：{money(r.budget.committed/r.target_actual)}。这不是获客成本，也不是营销收益或因果增量。</p></Panel>
    <Panel title="如果由你负责，下一轮准备怎么办？"><p>规则给出提醒，最终决定由经营人员作出。选择行动并写下理由，把你的判断与当前案例数据一起留下。</p><form onSubmit={e=>{e.preventDefault();dispatch({type:'decision',value:selected,reason:activeReason});}}><label htmlFor="decision">下一轮活动规模</label><select id="decision" value={selected} onChange={e=>setChoice(e.target.value)} required><option value="">请选择</option>{f.decisions.map(d=><option key={d}>{d}</option>)}</select><label htmlFor="decision-reason">决定的原因</label><textarea id="decision-reason" rows={4} maxLength={3000} value={reason ?? state.decisionReason} onChange={e=>setReason(e.target.value)} placeholder="例如：你会先检查哪家商户、什么问题，以及为什么保持或调整整体规模。" required /><button className="button primary" disabled={!settled || !selected || !activeReason.trim()} type="submit">保存决定与当前案例数据</button></form>{!settled && <p className="quiet">先完成活动体验，才能保存决定。</p>}{state.decision && <div className="saved-decision" role="status"><strong>已记录：{state.decision}</strong><p>{state.decisionReason}</p><small>当时指标：{state.decisionMetrics?.claimed} 人领取 / {state.decisionMetrics?.redeemed} 人使用 / 银行成本 {money(state.decisionMetrics?.bankCost ?? 0)} / 目标记录 {state.decisionMetrics?.target} 人。仅保存在当前浏览器。</small></div>}{storageWarning && <p role="alert">浏览器未允许本地保存；当前页面可继续使用，但刷新后可能丢失决定。</p>}</Panel>
  </>;
  return <><PublicHeader /><div className="workbench"><aside className="journey"><span className="eyebrow">这次活动</span><h2>沉默客户<br />社区生活优惠</h2><p>银行预算 {money(f.campaign.budget)}<br />满 {f.benefit.minSpend/100} 减 {f.benefit.face/100} · {f.benefit.days} 天有效</p><nav aria-label="活动步骤">{storySteps.map((s,i)=><Link key={s.key} to={'/demo/'+s.key} className={index===i?'active':''} aria-current={index===i?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span><strong>{s.label}</strong></Link>)}</nav><button className="reset" onClick={()=>{dispatch({type:'reset'});setChoice(null);setReason(null);go('segments');}}><ReloadOutlined /> 重新体验</button><small>固定合成数据<br />可自由查看各步，操作需按顺序完成。</small></aside><main className="step-content"><div className="step-head"><div className="eyebrow">第 {index+1} / {storySteps.length} 步 · {section==='wallet'?'客户视角':section==='redemption'?'商户视角':'经营人员视角'}</div><h1>{step.title}</h1><div className="task-note"><p><strong>现在做什么</strong>{step.task}</p><p><strong>做完会怎样</strong>{step.result}</p></div></div>{content}<nav className="step-bottom" aria-label="前后步骤">{index>0?<Link to={'/demo/'+storySteps[index-1].key}>← 上一步：{storySteps[index-1].label}</Link>:<Link to="/">← 返回案例背景</Link>}<span>固定案例 · 与完整系统数据一致</span></nav></main></div><PublicFooter /></>;
}
