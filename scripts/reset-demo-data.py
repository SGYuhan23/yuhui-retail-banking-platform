#!/usr/bin/env python3
"""Explicitly reset V3 synthetic data only; preserves original lottery and credit ledgers."""
import json,os,urllib.request
seed=int(os.environ.get('DEMO_SEED','202610'))
req=urllib.request.Request('http://127.0.0.1:18091/api/v1/v3/demo/reset',data=json.dumps({'seed':seed,'confirmation':'RESET_V3_DEMO'}).encode(),headers={'Content-Type':'application/json'})
with urllib.request.urlopen(req,timeout=300) as response: result=json.load(response)
if result.get('code')!=1000: raise SystemExit(result)
r=result['data'];print(json.dumps({'seed':seed,'customers':r['customers'],'run_id':r['run_id'],'funnel':r['review']['funnel'],'budget':r['review']['budget']},ensure_ascii=False,indent=2))
