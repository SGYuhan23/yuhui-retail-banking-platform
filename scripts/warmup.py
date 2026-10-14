import sys,time
sys.path.insert(0,str(__import__('pathlib').Path(__file__).resolve().parent))
from smoke import request
for attempt in range(90):
 r=request('/erp/activity/query_activity')
 if r.get('code')==1000:break
 time.sleep(1)
else:raise SystemExit('Backend did not become ready; see .runtime/backend.log')
for activity in r['data']:
 if activity['state']=='open':
  r=request('/activity/armory?activityId='+str(activity['id']),{})
  if r.get('code')!=1000:raise SystemExit('Activity warm-up failed: '+str(r))
print('Ready: http://127.0.0.1:18000/experience')
