import { request } from '@umijs/max';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Body = [] | [unknown];
const host = process.env.UMI_APP_API_HOST || '';
export const serviceUrl = (path: string) => `${host}/api/v1${path}`;

/** Preserve the existing long-ID decoding contract, including its text fallback. */
export function decodeResponse(input: unknown): unknown {
  if (typeof input !== 'string') return input;
  const quote = (_: string, prefix: string, digits: string) => `${prefix}"${digits}"`;
  const candidates = [
    input.replace(/(:\s*)(-?\d{16,})(?=\s*[,}])/g, quote)
      .replace(/([\[,\s])(-?\d{16,})(?=\s*[,\]])/g, quote),
    input,
  ];
  for (const text of candidates) {
    try { return JSON.parse(text); } catch { /* Try the unchanged wire text next. */ }
  }
  return input;
}

function exchange<T>(method: Method, path: string, body: Body, contentType?: string): Promise<T> {
  if (process.env.PAGES_DEMO) {
    return import('../../demo/adapter').then(({ demoRequest }) => demoRequest(method, path, body[0]) as Promise<T>);
  }
  const options = {
    method,
    ...(contentType ? { headers: { 'Content-Type': contentType } } : {}),
    ...(body.length ? { data: body[0] } : {}),
    getResponse: true,
    responseType: 'text' as const,
    transformResponse: [decodeResponse],
  };
  return request<{ data: T }>(serviceUrl(path), options).then(response => response?.data);
}

export const json = <T>(method: Method, path: string, ...body: Body) =>
  exchange<T>(method, path, body, 'application/json');
export const rewardsJson = <T>(method: Method, path: string, ...body: Body) =>
  exchange<T>(method, path, body, 'application/json;charset=utf-8');
export const multipart = <T>(method: Method, path: string, ...body: Body) =>
  exchange<T>(method, path, body);
