from smoke import request
from pathlib import Path
import json,subprocess
body={'userId':'10001','activityId':'1989345533881966594','behaviorRebateId':'1989346009608314882'}
key='is_receive_gift_'+body['activityId']+'_'+body['behaviorRebateId']
before=request('/activity/is_add_lottery_quota',body);assert before.get('data') is True,before
subprocess.run(['docker','compose','-f','compose.local.yml','exec','-T','redis','redis-cli','SREM',key,body['userId']],check=True,capture_output=True)
after=request('/activity/is_add_lottery_quota',body);assert after.get('data') is True,after
repeat=request('/activity/add_lottery_quota',body);assert repeat.get('code')==2010,repeat
out={'test':'gift receipt survives Redis member eviction','result':'PASS','before':before,'after':after,'duplicate':repeat}
Path('verification/gift-cache.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('Gift receipt cache-miss regression PASS')
