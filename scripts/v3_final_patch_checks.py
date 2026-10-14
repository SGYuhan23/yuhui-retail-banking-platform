"""Targeted assertions against running API/MySQL, shared by full V3 acceptance."""
from v3_test_support import *
import copy, time

def run_checks():
 demo=call('/runs')[-1]; rid=demo['id']; r=call(f'/runs/{rid}/review')
 version=next(x for x in call('/versions') if x['id']==demo['campaign_version_id']); frozen=json.loads(version['config_json'])
 check('TARGET-1: fixed demo target 150 / actual 224 / delta 74 / 149.333% / met',r['target_value']==150 and r['target_actual']==224 and r['target_delta']==74 and abs(r['target_achievement_rate']-224/150)<1e-9 and r['target_met'])
 check('TARGET frozen version and independent window SQL',r['target_value']==frozen['target_value'] and r['target_actual']==int(sql(f"SELECT COUNT(DISTINCT e.customer_id) FROM v3_event_ledger e JOIN v3_campaign_run r ON r.id=e.campaign_run_id WHERE r.id={rid} AND e.event_type='TARGET_ACTION_COMPLETED' AND e.occurred_at BETWEEN r.start_time AND r.end_time")))
 check('TIME-2 demo all entitlements terminal',r['fulfillment_status']=='SETTLED' and r['outstanding_entitlement_count']==0)
 # Fixtures insert new synthetic observations; immutable existing ledger rows are never edited.
 users=sql(f"SELECT m.customer_id FROM v3_segment_snapshot_member m WHERE m.snapshot_id={demo['segment_snapshot_id']} AND NOT EXISTS(SELECT 1 FROM v3_event_ledger e WHERE e.campaign_run_id={rid} AND e.customer_id=m.customer_id AND e.event_type='TARGET_ACTION_COMPLETED') ORDER BY m.customer_id LIMIT 10").splitlines()
 for user in users:
  sql(f"INSERT INTO v3_event_ledger(campaign_id,campaign_run_id,customer_id,segment_snapshot_id,event_type,scene_id,benefit_id,business_ref_id,idempotency_key,occurred_at,metadata_json) VALUES({demo['campaign_id']},{rid},'{user}',{demo['segment_snapshot_id']},'TARGET_ACTION_COMPLETED','COMMUNITY',{frozen['benefit_id']},'test-after-window','{rid}:TARGET_ACTION_COMPLETED:{user}',DATE_ADD('{demo['end_time']}',INTERVAL 1 SECOND),'{{\"mock_data\":true,\"test_fixture\":true}}')")
 after=call(f'/runs/{rid}/review')
 check('TARGET-2: ten post-window observations excluded (SQL total 234)',int(sql(f"SELECT COUNT(DISTINCT customer_id) FROM v3_event_ledger WHERE campaign_run_id={rid} AND event_type='TARGET_ACTION_COMPLETED'"))==234 and after['target_actual']==224 and after['funnel']['TARGET_ACTION_COMPLETED']==224 and sum(x['target_actions'] for x in after['breakdown']['scene'])==224)
 # Independent rule so fixture changes cannot alter the showcase campaign.
 rule={'logic':'AND','conditions':[{'field':'district','op':'=','value':'涪陵'}]}
 seg=call('/segments',{'name':'FINAL PATCH isolated segment','rule':rule})
 cat=call('/catalog');benefit=next(x for x in cat['benefits'] if x['type']=='COUPON');mids=[m['id'] for m in cat['merchants'] if m['scene_id']=='COMMUNITY'];mid=mids[0]
 now=datetime.datetime.now()
 cfg={'name':'FINAL PATCH fixture','objective':'CUSTOMER_REACTIVATION','segment_id':seg,'scene_id':'COMMUNITY','benefit_id':benefit['id'],'merchant_ids':mids,'bank_budget_total':6000,'target_metric':'MOCK_COMMUNITY_PURCHASE','target_value':150,'start_time':(now-datetime.timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'),'end_time':(now+datetime.timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'),'guardrail_config':{'max_bank_budget':2400,'max_cost_per_target_action':2400,'min_redemption_rate':0.2,'max_budget_burn_rate':0.9}}
 def create(config=None):return call('/campaigns',config or cfg)
 def approve(cid):
  call(f'/campaigns/{cid}/submit',{});call(f'/campaigns/{cid}/approve',{})
 def publish(config):
  cid=create(config);approve(cid);return cid,call(f'/campaigns/{cid}/publish',{})['version_id']
 def alloc(vid,amount,ok=True):return call(f'/versions/{vid}/runs',{'allocated_budget':amount},ok=ok)
 def cap_case(hard,amounts,label):
  conf=copy.deepcopy(cfg);conf['guardrail_config']['max_bank_budget']=hard
  cid,vid=publish(conf)
  for amount in amounts:alloc(vid,amount)
  err=alloc(vid,1,False)
  check(label,err['code']!=1000 and 'CAMPAIGN_BUDGET_CAP_EXCEEDED' in err['message'] and int(sql(f'SELECT SUM(budget_total) FROM v3_campaign_run WHERE campaign_id={cid}'))==sum(amounts))
 cap_case(2400,[2400],'BUDGET-1: total6000 hard2400, 2400 success then 1 rejected')
 cap_case(None,[3000,3000],'BUDGET-2: null hard, 3000+3000 allowed then 1 rejected')
 cap_case(5000,[2400,2600],'BUDGET-3: hard5000, 2400+2600 allowed then 1 rejected')
 cid,vid=publish(cfg)
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(lambda _:alloc(vid,2400,False),range(2)))
 check('BUDGET-4: concurrent Run allocation serialized on campaign',sum(x['code']==1000 for x in results)==1 and int(sql(f'SELECT SUM(budget_total) FROM v3_campaign_run WHERE campaign_id={cid}'))==2400)
 cid=create();approve(cid)
 original=next(x for x in call('/campaigns') if x['id']==cid)
 sql(f"UPDATE v3_campaign SET config_json=JSON_SET(config_json,'$.bank_budget_total',7000) WHERE id={cid}")
 err=call(f'/campaigns/{cid}/publish',{},ok=False)
 check('REVIEW-2: approved budget mutation rejected and DRAFT persists',err['code']!=1000 and 'REVIEW_CONTENT_CHANGED' in err['message'] and next(x for x in call('/campaigns') if x['id']==cid)['status']=='DRAFT' and sql(f'SELECT COUNT(*) FROM v3_campaign_version WHERE campaign_id={cid}')=='0')
 cid=create();call(f'/campaigns/{cid}/submit',{})
 submitted=next(x for x in call('/campaigns') if x['id']==cid)
 changed=copy.deepcopy(rule);changed['conditions'].append({'field':'points_balance','op':'>=','value':2000})
 call(f'/segments/{seg}',{'name':'FINAL PATCH changed rule','rule':changed},'PUT')
 call(f'/campaigns/{cid}/approve',{})
 check('REVIEW approve retains exact submitted payload',next(x for x in call('/campaigns') if x['id']==cid)['review_config_hash']==submitted['review_config_hash'])
 err=call(f'/campaigns/{cid}/publish',{},ok=False)
 check('REVIEW-3: segment-only change after submit rejected at publish','REVIEW_CONTENT_CHANGED' in err['message'] and err['code']!=1000)
 approve(cid);vid=call(f'/campaigns/{cid}/publish',{})['version_id']
 v=next(x for x in call('/versions') if x['id']==vid);vc=json.loads(v['config_json']);camp=next(x for x in call('/campaigns') if x['id']==cid)
 pub_payload={k:v for k,v in vc.items() if k not in ('segment_snapshot_id','review_config_hash')}
 check('REVIEW-1/4: re-review succeeds; published payload equals approved',pub_payload==json.loads(camp['review_config_json']) and vc['review_config_hash']==camp['review_config_hash'] and vc['segment_rule_json']==changed)
 # Critical case: mutate only Segment AFTER approval.
 cid=create();approve(cid)
 call(f'/segments/{seg}',{'name':'FINAL PATCH restored rule','rule':rule},'PUT')
 err=call(f'/campaigns/{cid}/publish',{},ok=False)
 check('REVIEW-3b: segment-only AFTER APPROVAL mutation rejected','REVIEW_CONTENT_CHANGED' in err['message'] and next(x for x in call('/campaigns') if x['id']==cid)['status']=='DRAFT')
 check('REVIEW-5: published version and snapshot immutable',sql(f"UPDATE v3_campaign_version SET config_json='{{}}' WHERE id={vid}",False).returncode!=0 and sql(f"UPDATE v3_segment_snapshot SET customer_count=0 WHERE id={v['segment_snapshot_id']}",False).returncode!=0)
 # Real time window: publish then claim before the configured end. Wait only to cross it.
 conf=copy.deepcopy(cfg);conf['end_time']=(datetime.datetime.now()+datetime.timedelta(seconds=15)).strftime('%Y-%m-%d %H:%M:%S')
 cid,vid=publish(conf);run=alloc(vid,2400)
 sid=int(sql(f'SELECT segment_snapshot_id FROM v3_campaign_run WHERE id={run}'))
 us=[x['customer_id'] for x in call(f'/snapshots/{sid}/members')][:2];ents=[]
 for u in us:
  for event in ['DELIVERED','PARTICIPATED']:call(f'/runs/{run}/events',{'customer_id':u,'event_type':event})
  ents.append(call(f'/runs/{run}/claim',{'customer_id':u,'merchant_id':mid}))
 call(f'/runs/{run}/end',{})
 r=call(f'/runs/{run}/review')
 check('TIME-1: ended Run with available entitlements is ONGOING',r['run']['status']=='ENDED' and r['fulfillment_status']=='ONGOING' and r['outstanding_entitlement_count']==2)
 did=call(f'/runs/{run}/decisions',{'decision_type':'KEEP','reason':'履约进行中，基于当前事实的阶段决策。'})
 snap=call(f'/runs/{run}/review')['decisions'][0]['metrics_snapshot_json']
 check('TIME ongoing fulfillment permits decision with frozen time semantics',did>0 and json.loads(snap)['fulfillment_status']=='ONGOING' and 'review_as_of' in json.loads(snap))
 until=datetime.datetime.strptime(conf['end_time'],'%Y-%m-%d %H:%M:%S')
 while datetime.datetime.now()<=until:time.sleep(0.25)
 call('/redeem',{'code':ents[0]['code'],'merchant_id':mid,'mock_spend':4000})
 r=call(f'/runs/{run}/review')
 check('TIME-3: redeem AFTER configured end changes cumulative costs, not target',r['target_actual']==0 and r['funnel']['REDEEMED']==1 and r['budget']['committed']==1200 and r['bank_cost']==1200 and r['outstanding_entitlement_count']==1)
 check('Decision history unchanged after fulfillment',r['decisions'][0]['metrics_snapshot_json']==snap)
 # Explicit expiry fixture avoids waiting seven real days; production release path is exercised.
 sql(f"UPDATE v3_entitlement SET expires_at=DATE_SUB(NOW(),INTERVAL 1 SECOND) WHERE code='{ents[1]['code']}'")
 call('/expire',{});call('/expire',{})
 r=call(f'/runs/{run}/review')
 check('TIME-4/BUDGET-5: post-end expiry releases once and settles',r['budget']['released']==1200 and r['budget']['reserved']==0 and r['budget']['committed']==1200 and r['fulfillment_status']=='SETTLED' and r['target_actual']==0)
 terminal=int(sql(f"SELECT COUNT(*) FROM v3_entitlement WHERE campaign_run_id={run} AND status NOT IN ('REDEEMED','EXPIRED','CANCELLED')"))
 check('Fulfillment count independently reconciles to entitlement SQL',r['outstanding_entitlement_count']==terminal==0)
 check('Review exposes separate as-of, delivery and observation windows',all(r.get(k) for k in ['review_as_of','run_start_at','run_end_at','target_observation_start_at','target_observation_end_at']) and r['target_observation_start_at']==r['run_start_at'] and r['target_observation_end_at']==r['run_end_at'])
 return checks
