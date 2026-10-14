# -*- coding: utf-8 -*-
from smoke import request
from pathlib import Path
from decimal import Decimal
import subprocess,time,json,urllib.request,base64
user='award-check-'+str(int(time.time())); act='1989345533881966594'; body={'userId':user,'activityId':act}
def sql(s):
 return subprocess.run(['docker','compose','-f','compose.local.yml','exec','-T','-e','MYSQL_PWD=yuhui_local_only','mysql','mysql','-uroot','--batch','--skip-column-names'],input=s,text=True,capture_output=True,check=True).stdout.strip()
assert request('/activity/calendar_sign_rebate',body)['code']==1000
for _ in range(40):
 if request('/activity/query_user_credit_account',body).get('data')==5:break
 time.sleep(.25)
db=next('marketing_0'+str(i) for i in (1,2) if sql(f"SELECT COUNT(*) FROM marketing_0{i}.credit_account WHERE user_id='{user}';")=='1')
# A genuine own-user draw establishes the router shard and account. It is not a production customer.
assert request('/activity/draw',body)['code']==1000
for _ in range(40):
 records=request('/activity/query_my_award_record?activityId='+act+'&userId='+user)['data']['items']
 if records and all(x['awardState']=='complete' for x in records):break
 time.sleep(.25)
shard=next(str(i).zfill(3) for i in range(4) if sql(f"SELECT COUNT(*) FROM {db}.user_award_record_{i:03d} WHERE user_id='{user}';")!='0')
award_rows=request('/erp/award/query_award')['data']
credit=next(x for x in award_rows if x['awardKey']=='user_credit_random')
count=next(x for x in award_rows if x['awardKey']=='user_cj' and str(x['awardConfig'])=='1')
base=int(str(time.time_ns())[:16]); orders=[base+i for i in range(4)]
for order,award in zip(orders,[credit,credit,count,count]):
 sql(f"INSERT INTO {db}.user_award_record_{shard}(id,user_id,activity_id,strategy_id,user_order_id,award_id,award_title,award_time) VALUES({order},'{user}',{act},1,{order},{award['id']},'audit fixture',NOW());")
oldcredit=Decimal(str(request('/activity/query_user_credit_account',body)['data'])); oldcount=request('/activity/query_user_activity_account',body)['data']['totalCount']
def publish(order,award):
 message={'id':str(time.time_ns()),'timestamp':int(time.time()*1000),'data':dict(body,awardId=str(award['id']),userOrderId=str(order),awardConfig='2,2' if award==credit else '1')}
 payload={'properties':{'content_type':'text/plain','delivery_mode':2},'routing_key':'send_award','payload':json.dumps(message),'payload_encoding':'string'}
 req=urllib.request.Request('http://127.0.0.1:15673/api/exchanges/%2F/amq.default/publish',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Authorization':'Basic '+base64.b64encode(b'yuhui:yuhui_local_only').decode()})
 with urllib.request.urlopen(req) as r:assert json.load(r)['routed']
for order,award in zip(orders,[credit,credit,count,count]): publish(order,award)
for _ in range(80):
 if sql(f"SELECT COUNT(*) FROM {db}.user_award_record_{shard} WHERE user_order_id IN ({','.join(map(str,orders))}) AND award_state='complete';")=='4':break
 time.sleep(.25)
else:raise AssertionError('Awards not settled')
assert Decimal(str(request('/activity/query_user_credit_account',body)['data']))==oldcredit+4
assert request('/activity/query_user_activity_account',body)['data']['totalCount']==oldcount+2
# Replay across time boundaries as well as back-to-back delivery.
time.sleep(1.1)
for _ in range(3):
 for order,award in zip(orders,[credit,credit,count,count]): publish(order,award)
time.sleep(3)
assert Decimal(str(request('/activity/query_user_credit_account',body)['data']))==oldcredit+4
assert request('/activity/query_user_activity_account',body)['data']['totalCount']==oldcount+2
assert sql(f"SELECT COUNT(*) FROM {db}.credit_record_{shard} WHERE user_id='{user}' AND out_business_no IN ('lottery-award:{orders[0]}','lottery-award:{orders[1]}');")=='2'
assert sql(f"SELECT COUNT(*) FROM {db}.activity_record_{shard} WHERE user_id='{user}' AND out_business_no IN ('lottery-count:{orders[2]}','lottery-count:{orders[3]}');")=='2'
Path('verification/award-replay.json').write_text(json.dumps({'result':'PASS','testUser':user,'checks':['two independent credit awards both settle','two count awards both settle','12 replay deliveries do not add credits','12 replay deliveries do not add quota','one durable business ledger entry per award'], 'scope':'Real RabbitMQ deliveries, isolated synthetic user; audit fixtures retained for traceability'},ensure_ascii=False,indent=2));print('PASS award replay: 5 checks')
