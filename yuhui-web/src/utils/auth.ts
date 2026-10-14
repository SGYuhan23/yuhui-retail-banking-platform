// @ts-ignore
/* eslint-disable */
import { user_refresh } from '@/services/api';

export const AUTH_TOKEN_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const TOKEN_EXPIRES_AT_KEY = 'tokenExpiresAt';
export const CURRENT_USER_KEY = 'currentUser';

/** Access Token 剩余不足 2 分钟时触发静默刷新 */
const REFRESH_AHEAD_MS = 2 * 60 * 1000;

type LoginLike = {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function isAdminUser(user?: API.CurrentUser | null): boolean {
  if (!user) return false;
  if (user.access === 'admin') return true;
  return (user.roles || []).includes('ROLE_ADMIN');
}

/** 登录/刷新响应 → 前端用户态（角色来自 auth-service 令牌） */
export function buildCurrentUser(data: LoginLike): API.CurrentUser {
  const roles = data.roles || [];
  return {
    userId: String(data.id),
    name: data.nickname || data.username || '用户',
    nickname: data.nickname,
    avatar: data.avatar,
    roles,
    permissions: data.permissions || [],
    access: roles.includes('ROLE_ADMIN') ? 'admin' : 'user',
  };
}

/** 保存登录会话（令牌 + 用户态） */
export function saveLoginSession(data: LoginLike): API.CurrentUser {
  localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken || '');
  localStorage.setItem(
    TOKEN_EXPIRES_AT_KEY,
    String(Date.now() + (data.expiresIn || 3600) * 1000),
  );
  const currentUser = buildCurrentUser(data);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
}

/** 保留已有用户态，仅更新令牌（刷新场景） */
export function updateSessionTokens(data: LoginLike): void {
  localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken || '');
  localStorage.setItem(
    TOKEN_EXPIRES_AT_KEY,
    String(Date.now() + (data.expiresIn || 3600) * 1000),
  );
}

export function clearLoginSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

let refreshing: Promise<boolean> | null = null;

/** 静默刷新令牌对（单飞：并发请求只触发一次） */
export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);
  refreshing = user_refresh(refreshToken)
    .then((resp) => {
      const data = resp?.data;
      if (resp?.code === 1000 && data?.accessToken) {
        updateSessionTokens(data);
        return true;
      }
      return false;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/** Access Token 即将过期时提前刷新，返回是否仍然持有有效会话 */
export async function ensureFreshToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_AT_KEY) || 0);
  if (expiresAt - Date.now() > REFRESH_AHEAD_MS) return true;
  return refreshSession();
}

export type OAuthFragmentResult =
  | { type: 'login'; data: LoginLike }
  | { type: 'error'; message: string }
  | null;

/**
 * 解析 OAuth 回调重定向带来的 URL fragment：
 * 后端 302 到 /user/login#oauth=<accessToken>|<refreshToken>|<expiresIn>
 * 或 /user/login#oauth_error=<urlencoded 消息>
 */
export function consumeOAuthFragment(): OAuthFragmentResult {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#')) return null;
  const raw = hash.substring(1);
  if (raw.startsWith('oauth=')) {
    const value = decodeURIComponent(raw.substring('oauth='.length));
    const parts = value.split('|');
    if (parts.length >= 2 && parts[0]) {
      historyClean();
      return {
        type: 'login',
        data: {
          id: 0,
          username: '',
          accessToken: parts[0],
          refreshToken: parts[1] || '',
          expiresIn: Number(parts[2] || 900),
        },
      };
    }
    historyClean();
    return { type: 'error', message: '第三方登录失败' };
  }
  if (raw.startsWith('oauth_error=')) {
    const messageValue = decodeURIComponent(raw.substring('oauth_error='.length));
    historyClean();
    return { type: 'error', message: messageValue || '第三方登录失败' };
  }
  return null;
}

function historyClean() {
  // fragment 不参与路由，清掉避免刷新重复消费
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
