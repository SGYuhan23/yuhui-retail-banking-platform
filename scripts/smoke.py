import json,urllib.request,urllib.error,re,time
from pathlib import Path
BASE='http://127.0.0.1:18000/api/v1'
def request(path,data=None):
 req=urllib.request.Request(BASE+path,headers={'Content-Type':'application/json'},data=json.dumps(data).encode() if data is not None else None)
 try:
  with urllib.request.urlopen(req,timeout=20) as r:return json.load(r)
 except Exception as e:return {'error':str(e)}
if __name__=='__main__':
 results={}
 api=Path('yuhui-web/src/services/api.ts').read_text()
 for url in sorted(set(re.findall(r'\$\{apiHostUrl\}/api/v1(/erp/[^`$?]+)',api))):
  if '/query_' in url or url.startswith('/erp/query_'):
   suffix = '?activityId=1989345533881966594' if url.endswith(('query_behavior_gift','query_user_award_record_by_activity_id')) else '?ruleTreeId=1989339970464866305' if url.endswith('query_rule_tree_node_one') else ''
   r=request(url+suffix);results[url]=r
   print(url, r.get('code'),r.get('message'),len(r.get('data') or []) if isinstance(r.get('data'),list) else r.get('error',''))
 Path('verification/read-api.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))

 if __name__=="__main__":
  assert all(r.get("code")==1000 for r in results.values()), "One or more read APIs failed"
