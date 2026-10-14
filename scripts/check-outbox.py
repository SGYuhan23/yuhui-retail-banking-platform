from pathlib import Path
import subprocess,time,json

def sql(s):
 return subprocess.run(['docker','compose','-f','compose.local.yml','exec','-T','-e','MYSQL_PWD=yuhui_local_only','mysql','mysql','-uroot','--batch','--skip-column-names'],input=s,text=True,capture_output=True,check=True).stdout.strip()
# Reuse the shard of an existing test user's task, but create/delete only this test message.
user=json.loads(Path('verification/flow.json').read_text())['testUser']
assert user.startswith('replica-check-') and user[14:].isdigit(),user
db=next('marketing_0'+str(i) for i in (1,2) if int(sql(f"SELECT COUNT(*) FROM marketing_0{i}.task WHERE user_id='{user}';")))
mid=str(time.time_ns())[-16:]; checks=[]
try:
 sql(f"INSERT INTO {db}.task(topic,activity_id,user_id,message_id,message,state,update_time) VALUES('bank_probe_missing_queue',1989345533881966594,'{user}','{mid}','bank_probe_unused_cache_prefix','fail',DATE_SUB(NOW(),INTERVAL 1 DAY));")
 def row():return sql(f"SELECT state,TIMESTAMPDIFF(SECOND,update_time,NOW()) FROM {db}.task WHERE message_id='{mid}';").split('\t')
 for i in range(30):
  state,age=row()
  if state=='fail' and int(age)<30:break
  time.sleep(1)
 else:raise AssertionError('Old failed task was not scanned')
 checks.append('One-day-old failure retried; unroutable publish remains fail, never completed')
 sql(f"UPDATE {db}.task SET topic='delete_keys_with_prefix',update_time=DATE_SUB(NOW(),INTERVAL 10 SECOND) WHERE message_id='{mid}';")
 for i in range(30):
  state,age=row()
  if state=='completed':break
  time.sleep(1)
 else:raise AssertionError('Recovered routing was not confirmed and completed')
 checks.append('After routing repaired, broker-confirmed retry marks completed')
 Path('verification/outbox.json').write_text(json.dumps({'result':'PASS','checks':checks,'scope':'Real broker unroutable-message injection and recovery; own fixture removed'},ensure_ascii=False,indent=2));print('PASS outbox:',len(checks),'checks')
finally:sql(f"DELETE FROM {db}.task WHERE message_id='{mid}';")
