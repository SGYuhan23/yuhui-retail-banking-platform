import os,sys,signal,subprocess,socket,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; runtime=ROOT/'.runtime';runtime.mkdir(exist_ok=True)

def alive(pid):
 try: os.kill(pid,0);return True
 except ProcessLookupError:return False

def stop(name):
 f=runtime/(name+'.pid')
 if f.exists():
  pid=int(f.read_text())
  if alive(pid):
   command=subprocess.run(['ps','-p',str(pid),'-o','command='],capture_output=True,text=True).stdout
   if 'yuhui-server.jar' in command or 'scripts/serve.mjs' in command:
    os.kill(pid,signal.SIGTERM)
    for _ in range(40):
     if not alive(pid):break
     time.sleep(.25)
   else:raise SystemExit('PID belongs to another process; refusing to stop it')
   if alive(pid):
    os.kill(pid,signal.SIGKILL)
    time.sleep(.5)
  f.unlink()

if sys.argv[1]=='stop':
 for name in ['frontend','backend']:stop(name)
else:
 for name,port,cmd in [('backend',18091,[str(Path(os.environ['JAVA_HOME'])/'bin/java'),'-Xms128m','-Xmx512m','-jar','yuhui-server/runtime/target/yuhui-server.jar','--spring.profiles.active=local']),('frontend',18000,['node','scripts/serve.mjs'])]:
  stop(name)
  with socket.socket() as s:
   if s.connect_ex(('127.0.0.1',port))==0:raise SystemExit(f'Port {port} already in use; do not start another instance')
  with (runtime/(name+'.log')).open('ab') as log:
   p=subprocess.Popen(cmd,cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  (runtime/(name+'.pid')).write_text(str(p.pid))
 print('Started local replica: http://127.0.0.1:18000/experience')
