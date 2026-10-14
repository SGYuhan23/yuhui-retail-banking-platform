from smoke import request
from pathlib import Path
import subprocess,json
act='1989345533881966594'
def redis(*args):
 return subprocess.run(['docker','compose','-f','compose.local.yml','exec','-T','redis','redis-cli','--raw',*args],capture_output=True,text=True,check=True).stdout.strip()
skus=request('/activity/query_sku_product_list_by_activity_id?activityId='+act)['data']
keys=['activity_sku_stock_count_'+str(x['id']) for x in skus]
def snapshot():return {k:redis('GET',k) for k in keys}
before=snapshot();assert all(v and int(v)>=0 for v in before.values()),before
for _ in range(3):assert request('/activity/armory?activityId='+act,{})['code']==1000
after=snapshot();assert before==after,(before,after)
Path('verification/warmup.json').write_text(json.dumps({'result':'PASS','checks':['three repeated warmups preserve all existing SKU stock counters'],'before':before,'after':after},indent=2));print('PASS warmup: existing stock preserved')
