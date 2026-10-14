#!/usr/bin/env python3
"""Real MySQL + HTTP V3 acceptance. Explicitly resets V3-only synthetic fixtures."""
import concurrent.futures,json,subprocess,urllib.request,urllib.error,hashlib,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='http://127.0.0.1:18091/api/v1/v3'
checks=[]
def call(path,data=None,method=None,ok=True):
 req=urllib.request.Request(BASE+path,data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'},method=method or ('POST' if data is not None else 'GET'))
 try:
  with urllib.request.urlopen(req,timeout=300) as r: value=json.load(r)
 except urllib.error.HTTPError as e:
  if ok:raise
  return {'code':e.code}
 if ok: assert value.get('code')==1000,(path,value)
 return value.get('data') if ok else value

def sql(query,ok=True):
 r=subprocess.run(['docker','compose','-f',str(ROOT/'compose.local.yml'),'exec','-T','-e','MYSQL_PWD=yuhui_local_only','mysql','mysql','-uroot','--default-character-set=utf8mb4','--batch','--skip-column-names','marketing'],input=query,text=True,capture_output=True)
 if ok:assert r.returncode==0,r.stderr
 return r.stdout.strip() if ok else r

def check(name,condition=True):
 assert condition,name
 checks.append({'name':name,'result':'PASS'});print('PASS',name,flush=True)
def reset():return call('/demo/reset',{'seed':202610,'confirmation':'RESET_V3_DEMO'})
def fingerprint(r):
 data={'funnel':r['review']['funnel'],'budget':r['review']['budget'],'customer_hash':hashlib.sha256(sql('SELECT * FROM v3_customer ORDER BY customer_id').encode()).hexdigest(),'events':sql('SELECT event_type,COUNT(*) FROM v3_event_ledger GROUP BY event_type ORDER BY event_type'),'costs':sql('SELECT operation_type,SUM(bank_amount),SUM(reserved_delta),SUM(committed_delta) FROM v3_budget_ledger GROUP BY operation_type ORDER BY operation_type')}
 return data
