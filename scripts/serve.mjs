import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../yuhui-web/dist');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.json':'application/json', '.woff2':'font/woff2' };
const server=http.createServer((req,res)=>{
 if(req.url.startsWith('/api/')) {
  const proxy=http.request({hostname:'127.0.0.1',port:18091,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:18091'}}, upstream=>{res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);});
  proxy.on('error',()=>{res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({code:502,message:'本地后端尚未就绪'}));});req.pipe(proxy);return;
 }
 let file;
 try { file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)); } catch {res.writeHead(400);res.end();return;}
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 if(!fs.existsSync(file)||fs.statSync(file).isDirectory()) file=path.join(root,'index.html');
 const stream=fs.createReadStream(file);
 stream.on('error',()=>{
  if(res.headersSent){res.destroy();return;}
  res.writeHead(503,{'content-type':'text/plain; charset=utf-8','retry-after':'3'});
  res.end('页面正在更新，请稍后刷新。');
 });
 stream.on('open',()=>{
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-cache'});
  stream.pipe(res);
 });
});
server.listen(18000,'127.0.0.1',()=>console.log('Local replica: http://127.0.0.1:18000/experience'));
