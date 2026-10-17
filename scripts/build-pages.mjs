import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.PAGES_BASE || '/yuhui-retail-banking-platform/';
if (!/^\/[a-zA-Z0-9_/-]*\/$/.test(base)) throw new Error('PAGES_BASE must be an absolute directory path ending in /');
const result = spawnSync('npm', ['run', 'build'], {
  cwd: resolve(root, 'yuhui-web'), stdio: 'inherit',
  env: { ...process.env, REPLICA_LOCAL: 'true', PAGES_DEMO: 'true', PAGES_BASE: base },
});
if (result.status !== 0) process.exit(result.status || 1);
const dist = resolve(root, 'yuhui-web/dist');
const entry = resolve(dist, 'index.html');
const canonical = `<script>if(location.pathname!==${JSON.stringify(base)}&&location.pathname.endsWith('/')){history.replaceState(null,'',location.pathname.slice(0,-1)+location.search+location.hash)}</script>`;
await writeFile(entry, (await readFile(entry, 'utf8')).replace('<head>', '<head>' + canonical));
// GitHub Pages serves these directory indexes on direct navigation and refresh.
const routes = [...new Set([...((await readFile(resolve(root, 'yuhui-web/config/routes.ts'), 'utf8')).matchAll(/path:\s*'([^']+)'/g))].map(m => m[1]))].filter(p => p.startsWith('/') && p !== '/');
for (const route of routes) {
  const destination = resolve(dist, '.' + route, 'index.html');
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(dist, 'index.html'), destination);
}
await copyFile(resolve(dist, 'index.html'), resolve(dist, '404.html'));
await writeFile(resolve(dist, '.nojekyll'), '');
await writeFile(resolve(dist, 'release.json'), JSON.stringify({ mode: 'browser-local-demo', base, routes, commit: process.env.GITHUB_SHA || 'local' }, null, 2));
console.log(`Pages artifact: ${routes.length} direct-route indexes; ${base}`);
