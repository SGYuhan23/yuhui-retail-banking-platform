from smoke import request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,json,time
# Isolated fixtures; never edits existing user awards. Test-only IDs are removed in finally.
base=str(time.time_ns())[:16]; own=base+'1';other=base+'2'
def sql(s):
 return subprocess.run(['docker','compose','-f','compose.local.yml','exec','-T','-e','MYSQL_PWD=yuhui_local_only','mysql','mysql','-uroot','--batch','--skip-column-names','marketing'],input=s,text=True,capture_output=True,check=True).stdout
checks=[]
try:
 sql(f"INSERT INTO local_entitlement(user_order_id,user_id,activity_id,award_id,award_key,award_config) VALUES({own},'10002',1989345533881966594,1989336435136356353,'bank_coupon','1'),({other},'wallet-other',1989345533881966594,1989336435136356353,'bank_coupon','1');")
 r=request('/local/wallet');assert any(x['id']==own for x in r['data']);assert not any(x['id']==other for x in r['data']);checks.append('wallet scoped to fixed principal; long IDs serialized as strings')
 assert request('/local/wallet/redeem',{'orderId':other,'userId':'wallet-other'})['code']==4001;checks.append('foreign ownership rejected even with forged userId')
 assert request('/local/wallet/redeem',{'orderId':'invalid'})['code']==4000;checks.append('invalid identifier rejected')
 with ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(lambda _:request('/local/wallet/redeem',{'orderId':own}),range(16)))
 assert sum(x['code']==1000 for x in results)==1,results
 assert sum(x['code']==4001 for x in results)==15,results
 assert sql(f'SELECT COUNT(*) FROM local_entitlement_redemption WHERE user_order_id={own};').strip()=='1';checks.append('16 concurrent attempts: exactly one redemption persisted')
 assert next(x for x in request('/local/wallet')['data'] if x['id']==own)['redeemedAt'];checks.append('redeemed state visible after reload')
 Path('verification/wallet.json').write_text(json.dumps({'result':'PASS','checks':checks},ensure_ascii=False,indent=2));print('PASS wallet:',len(checks),'checks')
finally:
 sql(f'DELETE FROM local_entitlement_redemption WHERE user_order_id IN ({own},{other}); DELETE FROM local_entitlement WHERE user_order_id IN ({own},{other});')
