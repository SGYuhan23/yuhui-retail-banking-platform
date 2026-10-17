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
 # Explicit inventory prevents a service-layer refactor from silently running zero checks.
 for url in ['/erp/activity/query_activity', '/erp/activity_count/query_activity_count', '/erp/activity_sku/query_activity_sku', '/erp/award/query_award', '/erp/behavior/query_behavior', '/erp/behavior/query_behavior_gift', '/erp/query_activity_account', '/erp/query_activity_record', '/erp/query_credit_account', '/erp/query_credit_record', '/erp/query_user_award_record', '/erp/query_user_award_record_by_activity_id', '/erp/query_user_behavior_rebate_order', '/erp/query_user_order', '/erp/rule/query_rule', '/erp/rule/tree/node/line/query_rule_tree_node_line', '/erp/rule/tree/node/query_rule_tree_node', '/erp/rule/tree/node/query_rule_tree_node_one', '/erp/rule/tree/query_rule_tree', '/erp/strategy/award/query_strategy_award', '/erp/strategy/query_strategy']:
   suffix = '?activityId=1989345533881966594' if url.endswith(('query_behavior_gift','query_user_award_record_by_activity_id')) else '?ruleTreeId=1989339970464866305' if url.endswith('query_rule_tree_node_one') else ''
   r=request(url+suffix);results[url]=r
   print(url, r.get('code'),r.get('message'),len(r.get('data') or []) if isinstance(r.get('data'),list) else r.get('error',''))
 Path('verification/read-api.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))

 if __name__=="__main__":
  assert len(results)==21 and all(r.get("code")==1000 for r in results.values()), "One or more read APIs failed"
