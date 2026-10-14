from smoke import request
from pathlib import Path
import re,json,time
specs=[('activity','activity','Activity','activityDesc'),('activity_count','activity_count','ActivityCount','totalCount'),('award','award','Award','awardDesc'),('rule','rule','Rule','ruleDesc'),('rule/tree','rule_tree','RuleTree','treeDesc'),('strategy','strategy','Strategy','strategyDesc'),('activity_sku','activity_sku','ActivitySku','productAmount'),('behavior','behavior','BehaviorRebate','rebateDesc'),('rule/tree/node','rule_tree_node','RuleTreeNode','ruleDesc'),('rule/tree/node/line','rule_tree_node_line','RuleTreeNodeLine','ruleLimitValue'),('strategy/award','strategy_award','StrategyAward','awardSubtitle')]
specs.sort(key=lambda x: 0 if x[1]=='strategy' else 1)
created={};reports=[];cleanup=[]
try:
 for folder,name,dto,field in specs:
  prefix='/erp/'+folder+'/'
  rows=request(prefix+'query_'+name)['data'];before={str(x['id']) for x in rows}
  p=Path('yuhui-server/contracts/src/main/java/com/yuhui/trigger/api/dto/req/'+dto+'RequestDTO.java')
  fields=re.findall(r'private \w+ (\w+);',p.read_text());source=rows[0]
  data={k:source[k] for k in fields if k!='id' and k in source}
  if name=='strategy':data['ruleModels']=None
  if name=='activity':data['strategyId']=created['strategy']
  if 'activityId' in data:data['activityId']=created['activity']
  if 'activityCountId' in data:data['activityCountId']=created['activity_count']
  if 'ruleTreeId' in data:data['ruleTreeId']=created['rule_tree']
  if name=='strategy_award':data['awardId']=created['award']
  if name=='activity':data['activityName']='复刻回归临时活动';data['state']='close'
  if name=='rule':data['ruleModel']='replica_test_rule'
  if name=='behavior':data['behaviorType']='activity_gift'
  add=request(prefix+'add_'+name,data);assert add.get('code')==1000,(name,'add',add)
  rows=request(prefix+'query_'+name)['data'];new=[x for x in rows if str(x['id']) not in before];assert len(new)==1,(name,'find inserted',new)
  uid=new[0]['id'];created[name]=uid;cleanup.append((prefix,name,uid));data['id']=uid
  val=data.get(field);data[field]=(val+1 if isinstance(val,(int,float)) else 'replica verification' if field!='ruleLimitValue' else val)
  update=request(prefix+'update_'+name,data);assert update.get('code')==1000,(name,'update',update)
  row=next(x for x in request(prefix+'query_'+name)['data'] if str(x['id'])==str(uid));assert row[field]==data[field],(name,'persistence',row)
  reports.append({'module':name,'create':True,'update':True,'read':True});print(name,'create/update/read PASS')
finally:
 for prefix,name,uid in reversed(cleanup):
  result=request(prefix+'delete_'+name+'/'+str(uid),{});remaining=request(prefix+'query_'+name).get('data',[])
  ok=result.get('code')==1000 and not any(str(x['id'])==str(uid) for x in remaining)
  print(name,'delete',ok)
  for r in reports:
   if r['module']==name:r['delete']=ok
 Path('verification/crud.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))

assert len(reports)==11 and all(r.get("delete") for r in reports), "CRUD verification incomplete"
