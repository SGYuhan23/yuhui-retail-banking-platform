import { useEffect, useReducer, useState, type ReactNode, type Dispatch } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import { fixtures as f } from '../demo/fixtures';
import { storySteps, r, unused, rate, fmt, amount, merchantName } from '../demo/story';
import { budget, initialState, loadState, reducer, storageKey, stageState, type DemoState, type Action } from '../demo/reducer';
import { Offer, PublicHeader, PublicFooter } from './Landing';

const reviewKey = storageKey + ':review';
function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return <section className={'panel ' + className}>{title && <h2>{title}</h2>}{children}</section>;
}
function MoneyView({ values }: { values: ReturnType<typeof budget> }) {
  return <div className="budget-grid" aria-label="银行预算">{([
    ['available', '可用预算'], ['reserved', '已预留'], ['committed', '已计成本'],
  ] as const).map(([key,label])=><div key={key}><span>{label}</span><strong>{amount(values[key])}</strong></div>)}</div>;
}
function Terms() {
  return <dl className="terms"><div><dt>目标客群</dt><dd>{f.segment.name} · {fmt(f.segment.count)} 人</dd></div><div><dt>银行预算</dt><dd>{amount(f.campaign.budget)}</dd></div><div><dt>每张券分担</dt><dd>银行 {amount(f.benefit.bankCost)} / 商户 {amount(f.benefit.merchantCost)}</dd></div><div><dt>活动日期</dt><dd>2026.10.01 — 10.12</dd></div><div><dt>用券期限</dt><dd>领取后 {f.benefit.days} 天</dd></div></dl>;
}
function RecordDetails() {
  return <details className="detail-section"><summary>目标指标与统计口径</summary><div className="detail-body"><div className="target-grid"><div><span>目标事件客户数</span><strong>{r.target_actual} 人</strong></div><div><span>预设目标</span><strong>{r.target_value} 人</strong></div><div><span>目标完成率</span><strong>{rate(r.target_actual,r.target_value)}</strong></div></div><p>224 人有单独的“模拟社区消费”记录，统计窗口为 2026 年 10 月 1—12 日。它不等同于核销人数，也不代表复购或持续活跃。</p><p>每名目标记录客户的银行成本为 {amount(r.budget.committed/r.target_actual)}。完成率仅表示记录人数与预设目标的比值，不衡量营销增量。</p><p>客户行为来自预设生成规则；500 份领取有数量上限，商户差异用于验证异常提示。用券及成本跟踪持续至权益处理完毕。</p></div></details>;
}

export default function Demo() {
  const [flowState, flowDispatch] = useReducer(reducer, initialState, ()=>loadState());
  const [storageWarning, setStorageWarning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.split('/')[2] || 'segments';
  const index = storySteps.findIndex(s=>s.key===section);
  const flow = new URLSearchParams(location.search).get('mode') === 'flow';
  useEffect(()=>{ window.scrollTo(0,0); },[section,flow]);
  useEffect(()=>{ try { localStorage.setItem(storageKey,JSON.stringify(flowState)); setStorageWarning(false); } catch { setStorageWarning(true); } },[flowState]);
  if(index<0) return <Navigate to="/demo/segments" replace />;
  function restart() { flowDispatch({type:'reset'}); navigate('/demo/segments?mode=flow'); }
  return <><PublicHeader /><div className="workbench"><aside className="journey"><h2>涪陵社区<br />生活优惠</h2><p>预算 {amount(f.campaign.budget)} · 满 40 减 20</p><nav aria-label="活动步骤">{storySteps.map((s,i)=><Link key={s.key} to={'/demo/'+s.key} className={index===i?'active':''} aria-current={index===i?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span><strong>{s.label}</strong></Link>)}</nav><button className="reset" onClick={restart}><ReloadOutlined /> {flow?'重新开始':'体验完整流程'}</button></aside><main className="step-content"><div className="step-head"><span className="mode-label">{flow?'完整流程':'分步查看'} · {index+1} / 7</span><h1>{storySteps[index].title}</h1><p>{storySteps[index].task}</p></div><Scene key={section+':'+flow} section={section} index={index} flow={flow} flowState={flowState} flowDispatch={flowDispatch} storageWarning={storageWarning} /></main></div><PublicFooter /></>;
}

function Scene({section,index,flow,flowState,flowDispatch,storageWarning}:{section:string;index:number;flow:boolean;flowState:DemoState;flowDispatch:Dispatch<Action>;storageWarning:boolean}) {
  const [preview, previewDispatch] = useReducer(reducer, section, key=>{
    const saved=key==='final-review'?loadState(reviewKey):null;
    return saved?.fulfillmentStatus==='履约完成'?saved:stageState(key);
  });
  const [choice,setChoice]=useState<string|null>(null);
  const [reason,setReason]=useState<string|null>(null);
  const [saveWarning,setSaveWarning]=useState(false);
  const navigate=useNavigate();
  const state=flow?flowState:preview;
  const dispatch=flow?flowDispatch:previewDispatch;
  const settled=state.fulfillmentStatus==='履约完成';
  const claimed=state.claimStatus==='已领取';
  const redeemed=state.redemptionStatus==='已核销';
  const funds=budget({...state,fulfillmentStatus:'进行中'});
  const selected=choice??state.decision;
  const activeReason=reason??state.decisionReason;
  const go=(key:string)=>navigate('/demo/'+key+(flow?'?mode=flow':''));
  useEffect(()=>{
    if(!flow && section==='final-review' && preview.decision) {
      try { localStorage.setItem(reviewKey,JSON.stringify(preview));setSaveWarning(false); } catch {setSaveWarning(true);}
    }
  },[preview,flow,section]);
  const next=(label:string,target:string)=><button className="button primary" onClick={()=>go(target)}>{label}<ArrowRightOutlined /></button>;
  const prerequisite=(text:string,target:string)=><div className="feedback info"><p>{text}</p>{next('返回'+storySteps.find(s=>s.key===target)?.label,target)}</div>;
  function act(action:Action) { dispatch(action); }
  const currentFeedback=state.notice ? <div className={'feedback '+(state.changed?'warning':'success')} role="status">{state.notice}</div>:null;
  let content:ReactNode;

  if(section==='segments') content=<>
    <Panel><div className="selection-count"><span>客户库 {fmt(f.customerCount)} 人</span><strong>{fmt(f.segment.count)} <small>人符合条件</small></strong></div><dl className="compact-rules">{f.segment.rules.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="inline-note">须同时满足全部条件。发布时保存名单，领取时再次检查营销许可。</p><div className="actions">{next('确认客群','campaign')}</div></Panel>
    <details className="detail-section"><summary>客群选择依据</summary><div className="detail-body"><p>本次选择较长时间未活跃、积分余额较高且偏好社区生活的客户，尝试用日常优惠邀请其参与活动。60–180 天和 2000 分均为预设筛选条件，尚未验证最优阈值；领券不扣积分。</p></div></details>
  </>;
  else if(section==='campaign') content=<>
    <div className="two-column"><Offer /><Panel title="方案信息"><Terms /><div className="capacity"><strong>{f.campaign.budget/f.benefit.bankCost} 份</strong><span>6000 元 ÷ 每份银行承担 12 元<br />未释放预算时的发放容量</span></div></Panel></div>
    <Panel title="适用商户"><div className="merchant-tags">{r.breakdown.merchant.map(m=><span key={m.name}>{merchantName(m.name)}</span>)}</div><p className="inline-note">领取时绑定一家商户，每人每批次限领一次。</p><div className="actions">{state.published?next('查看审核结果','review'):<button className="button primary" onClick={()=>{act({type:'submit'});go('review');}}>提交审核 <ArrowRightOutlined /></button>}</div></Panel>
    <details className="detail-section"><summary>活动目标</summary><div className="detail-body"><p>邀请沉默客户参与社区消费。系统另行统计“模拟社区消费”目标记录，预设目标 {f.campaign.goal} 人；该指标不代表客户已恢复长期活跃。</p></div></details>
  </>;
  else if(section==='review') content=<>
    {state.reviewStatus==='未提交' && prerequisite('请先提交活动方案。','campaign')}
    <Panel><div className="panel-top"><h2>待发布方案</h2><span className="pill">{state.reviewStatus}</span></div><Terms />
      {state.changed && <div className="config-diff"><div><small>已审核</small><strong>积分余额 ≥ 2000</strong></div><ArrowRightOutlined /><div><small>当前配置</small><strong>取消积分限制</strong></div></div>}
      {state.changed && <p className="inline-note">客群范围已改变，原审批不再适用；当前人数仍显示已审核名单。</p>}
      {currentFeedback}
      <div className="actions">{state.reviewStatus==='待复核' && <button className="button primary" onClick={()=>act({type:'approve'})}>通过审核</button>}{state.reviewStatus==='已通过' && !state.published && <button className="button primary" onClick={()=>act({type:'publish'})}>发布活动</button>}{state.reviewStatus==='需重新复核' && <button className="button primary" onClick={()=>act({type:'restore'})}>恢复原方案并重审</button>}{state.published && next('查看客户领券','wallet')}</div>
    </Panel>
    {!state.published && <details className="detail-section"><summary>审核后修改配置</summary><div className="detail-body"><p>修改客群条件后，再尝试发布，查看系统如何拦截。</p><button className="button" disabled={state.reviewStatus!=='已通过'||state.changed} onClick={()=>act({type:'change'})}>取消积分条件</button>{state.reviewStatus!=='已通过' && <p className="inline-note">先通过审核，再测试配置变更。</p>}</div></details>}
    <p className="inline-note">同一活动各批次的累计分配不得超过活动预算及设定的硬上限。</p>
  </>;
  else if(section==='wallet') content=<>
    {!state.published && prerequisite('活动发布后，客户才能领券。','review')}
    <div className="two-column"><Panel><div className="persona">客户 {f.customers[0].id}</div><Offer /><dl className="terms"><div><dt>适用商户</dt><dd>{merchantName(f.merchants[0].name)}</dd></div><div><dt>领取时间</dt><dd>{f.replay.claimAt}</dd></div><div><dt>有效期至</dt><dd>{f.replay.expiresAt}</dd></div></dl><button className="button primary full" disabled={!state.published||claimed||state.campaignStatus!=='已发布'} onClick={()=>act({type:'claim'})}>{claimed?'已领取':'领取优惠券'}</button></Panel><Panel title="银行预算"><MoneyView values={funds} /><div className="operation-result" aria-live="polite">{redeemed?<><strong>这张券已使用</strong><p>{amount(f.benefit.bankCost)} 已计入银行成本。</p></>:claimed?<><strong>已预留 {amount(f.benefit.bankCost)}</strong><p>待客户使用或券到期后处理。</p></>:<p>领取后将预留 {amount(f.benefit.bankCost)}，尚不计入成本。</p>}</div><p className="inline-note">单张权益操作</p></Panel></div>{claimed && next('前往商户核销','redemption')}
  </>;
  else if(section==='redemption') content=<>
    {!claimed && prerequisite('请先领取优惠券。','wallet')}
    <Panel title="核销信息"><dl className="terms"><div><dt>商户</dt><dd>{merchantName(f.merchants[0].name)}</dd></div><div><dt>消费金额</dt><dd>{amount(f.benefit.minSpend)} · 满 40 元可用</dd></div><div><dt>核销时间</dt><dd>{f.replay.redeemAt}</dd></div></dl><div className={'validation-list '+(redeemed?'validated':'')} aria-label="核销检查">{['绑定商户一致','满足消费门槛','优惠券未到期'].map(label=><span key={label}>{redeemed?'✓':'○'} {label}</span>)}</div><div className="actions"><button className="button primary" disabled={!claimed||redeemed} onClick={()=>act({type:'redeem'})}>{redeemed?'核销成功':'检查并核销'}</button>{redeemed && <button className="button" onClick={()=>act({type:'redeem'})}>检查重复核销</button>}</div>{redeemed && currentFeedback}</Panel>
    <Panel title="银行预算"><MoneyView values={funds} />{redeemed?<div className="operation-result"><strong>预留 −{amount(f.benefit.bankCost)}　成本 +{amount(f.benefit.bankCost)}</strong><p>商户另承担 {amount(f.benefit.merchantCost)}，客户合计享受 {amount(f.benefit.face)} 优惠。</p></div>:<p className="inline-note">核销成功后，预留的 12 元转为银行成本。</p>}</Panel>
    {redeemed && <button className="button primary" onClick={()=>{act({type:'end'});go('fulfillment');}}>查看整场活动结算 <ArrowRightOutlined /></button>}
  </>;
  else if(section==='fulfillment') {
    const fullBudget=settled?r.budget:{...r.budget,reserved:unused*f.benefit.bankCost,released:0,available:0};
    content=<>
      {!redeemed && prerequisite('完整流程需先完成客户用券。','redemption')}
      <Panel><div className="panel-top"><h2>已发放 {r.funnel.CLAIMED} 张券</h2><span className="pill">{settled?'结算完成':'已停止发放'}</span></div><p className="inline-note">整场活动 · 2026 年 10 月 12 日</p><div className="settlement-table"><div><span>已使用</span><strong>{r.funnel.REDEEMED} 张</strong><span>银行成本</span><strong>{amount(r.budget.committed)}</strong></div><div><span>{settled?'到期未使用':'到期待处理'}</span><strong>{unused} 张</strong><span>{settled?'已释放预算':'待释放预算'}</span><strong>{amount(r.budget.released)}</strong></div></div><MoneyView values={fullBudget} /><div className="actions"><button className="button primary" disabled={!redeemed||settled} onClick={()=>{act({type:'end'});act({type:'settle'});}}>{settled?'已释放到期预算':'处理到期权益'}</button>{settled && next('查看经营复盘','final-review')}</div>{settled && <p className="inline-note" role="status">全部权益已处理，剩余可用预算 {amount(r.budget.available)}。</p>}</Panel>
      <details className="detail-section"><summary>停止发券后的处理规则</summary><div className="detail-body"><p>停止发放后，已领取的券仍在各自有效期内使用。未使用的券到期后解除预算预留；释放金额不计为收入或额外余额。</p><p>本页切换至整场活动记录，展示 500 张券的处理结果。</p></div></details>
    </>;
  } else content=<>
    <div className="review-metrics"><div><span>银行成本</span><strong>{amount(r.budget.committed)}</strong></div><div><span>到期释放预算</span><strong>{amount(r.budget.released)}</strong></div><div><span>用券人数 / 领取人数</span><strong>{r.funnel.REDEEMED}<small> / {r.funnel.CLAIMED}</small></strong></div></div>
    <Panel title="商户表现"><div className="merchant-chart">{r.breakdown.merchant.map(m=><div className={'merchant-row '+(m.redemption_rate<.2?'flagged':'')} key={m.name}><strong>{merchantName(m.name)}</strong><div className="merchant-bar"><span style={{width:`${m.redeemed/m.claimed*100}%`}} /></div><span>{m.redeemed} / {m.claimed} 人用券</span><b>{rate(m.redeemed,m.claimed)}</b><span>银行成本 {amount(m.bank_cost)}</span></div>)}</div><div className="merchant-alert"><strong>需核查：{merchantName(r.breakdown.merchant[0].name)}</strong><p>用券率 {rate(r.breakdown.merchant[0].redeemed,r.breakdown.merchant[0].claimed)}，低于 20% 提示线。先核实客群匹配、使用门槛和到店便利性，再决定是否减额。</p></div></Panel>
    <Panel title="下一轮安排"><form onSubmit={e=>{e.preventDefault();act({type:'decision',value:selected,reason:activeReason});}}><label htmlFor="decision">活动规模</label><select id="decision" value={selected} onChange={e=>setChoice(e.target.value)} required><option value="">选择调整方式</option>{f.decisions.map(d=><option key={d}>{d}</option>)}</select><label htmlFor="decision-reason">决定原因</label><textarea id="decision-reason" rows={3} maxLength={3000} value={activeReason} onChange={e=>setReason(e.target.value)} placeholder="填写调整依据和需要跟进的问题" required /><button className="button primary" disabled={!settled||!selected||!activeReason.trim()} type="submit">保存安排</button><p className="inline-note">决定及当前指标仅保存在此浏览器。</p></form>{!settled && <div className="feedback info">{next('先完成活动结算','fulfillment')}<p>也可通过左侧“经营复盘”直接查看并操作结算后的阶段。</p></div>}{state.decision && <div className="saved-decision" role="status"><strong>已记录：{state.decision}</strong><p>{state.decisionReason}</p><small>指标快照：{state.decisionMetrics?.claimed} 人领取 / {state.decisionMetrics?.redeemed} 人用券 / 银行成本 {amount(state.decisionMetrics?.bankCost??0)}</small></div>}{(saveWarning||storageWarning) && <p role="alert">本地保存不可用，刷新后可能丢失本次决定。</p>}</Panel>
    <details className="detail-section"><summary>参与记录与成本明细</summary><div className="detail-body"><div className="funnel-story">{f.funnel.slice(0,5).map(([label,value])=><div key={label}><span>{label}</span><strong>{fmt(value)}</strong></div>)}</div><dl className="terms"><div><dt>商户承担</dt><dd>{amount(r.merchant_contribution)}</dd></div><div><dt>人均用券成本</dt><dd>{amount(r.budget.committed/r.funnel.REDEEMED)}（银行承担）</dd></div><div><dt>剩余预留</dt><dd>{amount(r.budget.reserved)}</dd></div><div><dt>可用预算</dt><dd>{amount(r.budget.available)}</dd></div></dl><p>人数按客户去重。到期释放的 2700 元已经包含在可用预算中。</p></div></details><RecordDetails />
  </>;
  return <>{content}<nav className="step-bottom" aria-label="前后步骤">{index>0?<button className="text-link" onClick={()=>go(storySteps[index-1].key)}>← {storySteps[index-1].label}</button>:<Link to="/">← 首页</Link>}{!flow && index<6 && <button className="text-link" onClick={()=>go(storySteps[index+1].key)}>{storySteps[index+1].label} →</button>}</nav></>;
}
