from smoke import request
from pathlib import Path
import json,time
act='1989345533881966594'; user='replica-check-'+str(int(time.time()));d={'activityId':act,'userId':user}; report=[]
def check(label,path,payload=None,code=1000):
 r=request(path,payload);assert r.get('code')==code,(label,r);report.append({'check':label,'result':'PASS','response':r});return r.get('data')
check('warmup','/activity/armory?activityId='+act,{})
check('gift grant','/activity/add_lottery_quota',dict(d,behaviorRebateId='1989346009608314882'))
check('duplicate gift prevented','/activity/add_lottery_quota',dict(d,behaviorRebateId='1989346009608314882'),2010)
check('daily sign','/activity/calendar_sign_rebate',d)
check('duplicate daily sign prevented','/activity/calendar_sign_rebate',d,1005)
for _ in range(40):
 a=request('/activity/query_user_activity_account',d).get('data') or {}
 c=request('/activity/query_user_credit_account',d).get('data')
 if a.get('totalCountSurplus')==2 and c==5:break
 time.sleep(.25)
a=check('quota persisted','/activity/query_user_activity_account',d);assert a['totalCountSurplus']==2,a
c=check('sign credit persisted','/activity/query_user_credit_account',d);assert c==5,c
sku=check('exchange catalogue','/activity/query_sku_product_list_by_activity_id?activityId='+act)
expensive=max(sku,key=lambda s:s['productAmount']);r=request('/activity/credit_pay_exchange_sku',dict(d,sku=str(expensive['id'])));assert r.get('code')==1013,r
report.append({'check':'insufficient credit rejected','result':'PASS','response':r})
for i in range(2):
 check('draw '+str(i+1),'/activity/draw',d);time.sleep(.7)
records=check('personal award history','/activity/query_my_award_record?activityId='+act+'&userId='+user)
assert records['total']==2,records
for i in range(20):
 records=request('/activity/query_my_award_record?activityId='+act+'&userId='+user)['data']
 if all(x['awardState']=='complete' for x in records['items']):break
 time.sleep(.5)
assert all(x['awardState']=='complete' for x in records['items']),records
report.append({'check':'asynchronous award settlement','result':'PASS'})
for name in ['query_user_order','query_user_award_record','query_activity_account','query_activity_record','query_credit_account','query_credit_record','query_user_behavior_rebate_order']:
 rows=check('ERP '+name,'/erp/'+name);assert any(str(x['userId'])==user for x in rows),(name,rows)
Path('verification/flow.json').write_text(json.dumps({'testUser':user,'checks':report},ensure_ascii=False,indent=2))
print('PASS:',len(report),'checks; test user:',user)
