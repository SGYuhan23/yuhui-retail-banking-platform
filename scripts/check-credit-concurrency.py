# -*- coding: utf-8 -*-
from smoke import request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from decimal import Decimal
import subprocess,time,json
act='1989345533881966594'; user='credit-check-'+str(int(time.time())); body={'userId':user,'activityId':act}
def sql(statement):
 return subprocess.run(['docker','compose','-f','compose.local.yml','exec','-T','-e','MYSQL_PWD=yuhui_local_only','mysql','mysql','-uroot','--batch','--skip-column-names'],input=statement,text=True,capture_output=True,check=True).stdout.strip()
assert request('/activity/calendar_sign_rebate',body)['code']==1000
for _ in range(40):
 if request('/activity/query_user_credit_account',body).get('data')==5:break
 time.sleep(.25)
else:raise AssertionError('Sign credit did not settle')
db=next('marketing_0'+str(i) for i in (1,2) if sql(f"SELECT COUNT(*) FROM marketing_0{i}.credit_account WHERE user_id='{user}';")=='1')
sku=min(request('/activity/query_sku_product_list_by_activity_id?activityId='+act)['data'],key=lambda x:x['productAmount']); cost=Decimal(str(sku['productAmount']))
assert cost>0
sql(f"UPDATE {db}.credit_account SET available_amount={cost},total_amount={cost} WHERE user_id='{user}';")
payload=dict(body,sku=str(sku['id']))
with ThreadPoolExecutor(max_workers=8) as pool:
 responses=list(pool.map(lambda _:request('/activity/credit_pay_exchange_sku',payload),range(8)))
assert sum(r.get('code')==1000 for r in responses)==1,responses
assert Decimal(str(request('/activity/query_user_credit_account',body)['data']))==0,responses
# There must be exactly one durable debit, and only its quota may be delivered.
def debit_count():
 return sum(int(sql(f"SELECT COUNT(*) FROM {db}.credit_record_00{i} WHERE user_id='{user}' AND trade_type='reverse';")) for i in range(4))
assert debit_count()==1
for _ in range(40):
 account=request('/activity/query_user_activity_account',body)['data']
 if account['totalCount']==2:break
 time.sleep(.25)
else:raise AssertionError(account)
# Freeze with enough funds: business precheck passes, atomic debit must reject and emit no success.
sql(f"UPDATE {db}.credit_account SET available_amount={cost},account_status='close' WHERE user_id='{user}';")
failed=request('/activity/credit_pay_exchange_sku',payload)
assert failed.get('code')==1013,failed
time.sleep(2)
assert debit_count()==1
assert request('/activity/query_user_activity_account',body)['data']['totalCount']==2
assert Decimal(str(request('/activity/query_user_credit_account',body)['data']))==cost
report={'result':'PASS','testUser':user,'checks':['8 concurrent exchanges: exactly one success','balance never below zero','exactly one debit persisted','exactly one purchased quota delivered','frozen account rejected','failed debit preserves balance and emits no quota delivery'], 'responses':responses,'frozenResponse':failed}
Path('verification/credit-concurrency.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS credit concurrency:',len(report['checks']),'checks')
