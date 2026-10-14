#!/usr/bin/env python3
"""Real MySQL + HTTP V3 acceptance, including FINAL PATCH invariants."""
from v3_test_support import *
first=reset();a=fingerprint(first);second=reset();b=fingerprint(second)
check('TEST 12: fixed seed customer contents, event counts and budget costs reproduce',a==b)
check('Demo dataset sizes',sql('SELECT COUNT(*) FROM v3_customer')=='30000' and len(call('/catalog')['merchants'])==12)
seg=call('/segments')[0];rule=json.loads(seg['rule_json']);p1=call('/segments/preview',rule);p2=call('/segments/preview',rule)
check('TEST 1: segment preview stable',p1==p2 and p1['consented_count']>0)
sid=call(f"/segments/{seg['id']}/snapshots",{})
members=call(f'/snapshots/{sid}/members');user=members[0]['customer_id'];before=sql(f'SELECT COUNT(*) FROM v3_segment_snapshot_member WHERE snapshot_id={sid}')
old=sql(f"SELECT district FROM v3_customer WHERE customer_id='{user}'")
sql(f"UPDATE v3_customer SET district='测试变化' WHERE customer_id='{user}'")
check('TEST 2: snapshot unchanged after customer mutation',sql(f'SELECT COUNT(*) FROM v3_segment_snapshot_member WHERE snapshot_id={sid}')==before and json.loads(call(f'/snapshots/{sid}/members')[0]['frozen_attributes_json'])['district']==old)
sql(f"UPDATE v3_customer SET district='{old}' WHERE customer_id='{user}'")
cat=call('/catalog');benefit=next(x for x in cat['benefits'] if x['type']=='COUPON');mids=[m['id'] for m in cat['merchants'] if m['scene_id']=='COMMUNITY'];mid=mids[0]
now=datetime.datetime.now();start=(now-datetime.timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S');end=(now+datetime.timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
config={'name':'V3 自动验收批次','objective':'CUSTOMER_REACTIVATION','segment_id':seg['id'],'scene_id':'COMMUNITY','benefit_id':benefit['id'],'merchant_ids':mids,'bank_budget_total':2400,'target_metric':'MOCK_COMMUNITY_PURCHASE','target_value':2,'start_time':start,'end_time':end,'guardrail_config':{'max_bank_budget':2400,'max_cost_per_target_action':2400,'min_redemption_rate':0.2,'max_budget_burn_rate':0.9}}
cid=call('/campaigns',config)
check('Governance cannot publish draft',call(f'/campaigns/{cid}/publish',{},ok=False)['code']!=1000)
call(f'/campaigns/{cid}/submit',{});call(f'/campaigns/{cid}/approve',{});vid=call(f'/campaigns/{cid}/publish',{})['version_id']
version=next(v for v in call('/versions') if v['id']==vid);snapshot=version['segment_snapshot_id']
check('TEST 3: published configuration API rejects edits',call(f'/campaigns/{cid}',dict(config,name='tamper'),'PUT',False)['code']!=1000)
check('TEST 3b: DB rejects version mutation',sql(f"UPDATE v3_campaign_version SET config_json='{{}}' WHERE id={vid}",False).returncode!=0)
check('Snapshot member DB mutation rejected',sql(f"DELETE FROM v3_segment_snapshot_member WHERE snapshot_id={snapshot} AND customer_id='{user}'",False).returncode!=0)
run=call(f'/versions/{vid}/runs',{})
check('Repeated batch cannot double campaign budget',call(f'/versions/{vid}/runs',{},ok=False)['code']!=1000)
users=[x['customer_id'] for x in call(f'/snapshots/{snapshot}/members')][:20]
for u in users:
 call(f'/runs/{run}/events',{'customer_id':u,'event_type':'DELIVERED'})
 call(f'/runs/{run}/events',{'customer_id':u,'event_type':'PARTICIPATED'})
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 claims=list(pool.map(lambda u:call(f'/runs/{run}/claim',{'customer_id':u,'merchant_id':mid},ok=False),users))
success=[r['data'] for r in claims if r['code']==1000];review=call(f'/runs/{run}/review')
check('TEST 4: 20 concurrent claims cannot exceed 2400-cent cap',len(success)==2 and review['budget']['reserved']==2400 and review['budget']['available']==0)
check('TEST 5: each claim writes one reserve and one claimed event',sql(f"SELECT COUNT(*) FROM v3_budget_ledger WHERE campaign_run_id={run} AND operation_type='RESERVE'")=='2' and review['funnel']['CLAIMED']==2)
code=success[0]['code'];u=success[0]['customer_id']
# MySQL DATETIME(0) may round the claim time into the next second.
# Wait for eligibility, preserving the no-redemption-before-claim rule and all expected counts.
import time
for _ in range(20):
 if sql(f"SELECT claimed_at < NOW(6) FROM v3_entitlement WHERE code='{code}'")=='1':break
 time.sleep(0.1)
else:raise AssertionError('Stored claim instant did not become eligible within 2 seconds')

check('TEST 9: repeated claim prevented',call(f'/runs/{run}/claim',{'customer_id':u,'merchant_id':mid},ok=False)['code']!=1000)
check('Wrong merchant cannot redeem',call('/redeem',{'code':code,'merchant_id':mids[1],'mock_spend':4000},ok=False)['code']!=1000)
check('Minimum spend enforced',call('/redeem',{'code':code,'merchant_id':mid,'mock_spend':3999},ok=False)['code']!=1000)
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 redemptions=list(pool.map(lambda _:call('/redeem',{'code':code,'merchant_id':mid,'mock_spend':4000},ok=False),range(16)))
check('TEST 8: 16 concurrent redeems exactly one success',sum(r['code']==1000 for r in redemptions)==1)
r=call(f'/runs/{run}/review');check('TEST 6: reserve transitions to commit',r['budget']['reserved']==1200 and r['budget']['committed']==1200)
other=success[1]['code'];sql(f"UPDATE v3_entitlement SET expires_at='2020-01-01' WHERE code='{other}'")
check('Expired redemption blocked',call('/redeem',{'code':other,'merchant_id':mid,'mock_spend':4000},ok=False)['code']!=1000)
call('/expire',{});call('/expire',{});r=call(f'/runs/{run}/review')
check('TEST 7: expiry releases once',r['budget']['reserved']==0 and r['budget']['released']==1200 and r['budget']['available']==1200)
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 events=list(pool.map(lambda _:call(f'/runs/{run}/events',{'customer_id':u,'event_type':'TARGET_ACTION_COMPLETED','action':'MOCK_COMMUNITY_PURCHASE'}),range(16)))
check('TEST 10: semantic event key idempotent',sum(e['created'] for e in events)==1)
r=call(f'/runs/{run}/review');committed=int(sql(f'SELECT SUM(committed_delta) FROM v3_budget_ledger WHERE campaign_run_id={run}'));target=int(sql(f"SELECT COUNT(DISTINCT customer_id) FROM v3_event_ledger WHERE campaign_run_id={run} AND event_type='TARGET_ACTION_COMPLETED'"))
check('TEST 11: dashboard independently reconstructed from SQL ledgers',r['bank_cost']==committed and r['cost_per_target_action_customer']==committed/target and r['funnel']['TARGET_ACTION_COMPLETED']==target)
check('Four dimensions present',set(r['breakdown'])=={'segment','scene','merchant','benefit'})
check('Public wallet hides bank and merchant costs','bank_cost' not in call('/wallet?customerId='+u)[0] and 'bank_cost' not in call('/wallet?customerId='+u)[0]['terms'])
check('Marketing consent mandatory',all(x['marketing_consent'] for x in map(lambda m:json.loads(m['frozen_attributes_json']),call(f'/snapshots/{snapshot}/members'))))
# Revoke live consent after freezing; historical membership stays, new marketing rejected.
revoked=users[-1];sql(f"UPDATE v3_customer SET marketing_consent=0 WHERE customer_id='{revoked}'")
check('Revoked live consent blocks new touch',call(f'/runs/{run}/events',{'customer_id':revoked,'event_type':'DELIVERED'},ok=False)['code']!=1000)
call(f'/runs/{run}/end',{})
did=call(f'/runs/{run}/decisions',{'decision_type':'REDUCE','reason':'根据合成流水和成本，在下一轮减少低核销商户额度。'})
check('Manual decision stores metrics snapshot',did>0 and json.loads(call(f'/runs/{run}/review')['decisions'][0]['metrics_snapshot_json'])['bank_cost']==committed)
check('Ledger historical updates blocked',sql(f"UPDATE v3_budget_ledger SET bank_amount=0 WHERE campaign_run_id={run}",False).returncode!=0)
from v3_final_patch_checks import run_checks
run_checks()
# Restore fixed showcase without test data.
final=reset()
check('Final showcase restored reproducibly',fingerprint(final)==a)
report={'result':'PASS','checks':checks,'demo':{'seed':202610,'run_id':final['run_id'],'funnel':final['review']['funnel'],'budget':final['review']['budget']}}
(ROOT/'verification/v3-acceptance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report['demo'],ensure_ascii=False,indent=2))
