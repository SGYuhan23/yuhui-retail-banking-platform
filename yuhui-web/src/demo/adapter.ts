import { execute, initialState, DemoState, Reply } from './engine';

const key = 'yuhui-pages-demo-v1';
let queue: Promise<unknown> = Promise.resolve();
function read(): DemoState {
  const text = localStorage.getItem(key);
  if (!text) return initialState();
  const state = JSON.parse(text);
  if (state.version !== 1 || !state.tables || !state.claims || !state.wallet) throw Error('本地演示数据格式无效，请清除此站点数据后重试');
  return state;
}
function assetPaths(value: any): any {
  if (typeof value === 'string' && value.startsWith('/assets/')) return (process.env.PAGES_BASE || '/') + value.slice(1);
  if (Array.isArray(value)) return value.map(assetPaths);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, assetPaths(v)]));
  return value;
}

/** Serializes each browser transaction and commits only after all validation succeeds. */
export function demoRequest(method: string, path: string, data?: any): Promise<Reply> {
  const run = async () => {
    if (path === '/file/upload' && method === 'POST') {
      const file = data instanceof FormData ? data.get('file') : null;
      if (!(file instanceof File) || !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) return { code: 1002, message: '请选择 2MB 以内的 PNG/JPEG/GIF/WebP 图片' };
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file);
      });
      return { code: 1000, message: url, data: url };
    }
    const { state, reply } = execute(read(), method, path, data);
    if (reply.code === 1000) localStorage.setItem(key, JSON.stringify(state));
    return assetPaths(reply);
  };
  const locked = () => navigator.locks ? navigator.locks.request(key, run) : run();
  const result = queue.then(locked, locked);
  queue = result.catch(() => undefined);
  return result;
}
