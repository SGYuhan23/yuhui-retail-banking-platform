import { request } from '@umijs/max';

export async function walletRequest(path: string, options: { method?: string; data?: unknown } = {}) {
  if (process.env.PAGES_DEMO) {
    const { demoRequest } = await import('../demo/adapter');
    return demoRequest(options.method || 'GET', path.replace(/^\/api\/v1/, ''), options.data);
  }
  return request(path, options);
}
