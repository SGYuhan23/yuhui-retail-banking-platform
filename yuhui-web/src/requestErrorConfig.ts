import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message } from 'antd';
import { stringify } from 'querystring';

const SESSION_EXPIRED_MESSAGE_KEY = 'session-expired';
let handlingUnauthorized = false;

function clearAuthAndRedirect() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('currentUser');
  const { search, pathname } = window.location;
  if (pathname !== '/user/login') {
    history.replace({
      pathname: '/user/login',
      search: stringify({ redirect: pathname + search }),
    });
  }
}

export const errorConfig: RequestConfig = {
  errorConfig: {
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) {
        throw error;
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Multiple concurrent 401 responses should only trigger one prompt and redirect.
          if (!handlingUnauthorized) {
            handlingUnauthorized = true;
            clearAuthAndRedirect();
            message.open({
              key: SESSION_EXPIRED_MESSAGE_KEY,
              type: 'error',
              content: '登录已过期，请重新登录',
            });
            window.setTimeout(() => {
              handlingUnauthorized = false;
            }, 1000);
          }
        } else if (status === 403) {
          message.error('没有权限访问');
        } else {
          message.error(`请求失败：${status}`);
        }
      } else if (error.request) {
        message.error('服务器无响应，请稍后重试');
      } else {
        message.error('请求异常，请重试');
      }
    },
  },

  requestInterceptors: [
    (url, options) => {
      const token = localStorage.getItem('authToken');
      const headers = { ...(options?.headers || {}) } as Record<string, string>;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return { url, options: { ...options, headers } };
    },
  ],

  responseInterceptors: [
    (response: any) => {
      return response;
    },
  ],
};
