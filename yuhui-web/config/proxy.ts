/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // 如果需要自定义本地开发服务器  请取消注释按需调整
  dev: {
    '/api/': {
      target: process.env.DEV_API_TARGET || 'http://127.0.0.1:8091',
      changeOrigin: true,
      ws: true,
      pathRewrite: { '^': '' },
      // 与线上边缘函数对齐：整页跳转场景以 access_token 查询参数传递令牌，
      // 代理层翻译成 Authorization 头并从转发 URL 中剥离
      onProxyReq(proxyReq: any, req: any) {
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('access_token');
        if (token) {
          if (!proxyReq.getHeader('authorization')) {
            proxyReq.setHeader('authorization', `Bearer ${token}`);
          }
          url.searchParams.delete('access_token');
          proxyReq.path = url.pathname + url.search;
        }
      },
    } as any,
  },

  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    '/api/': {
      target: process.env.TEST_API_TARGET || 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      ws: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: process.env.PRE_API_TARGET || 'your pre url',
      changeOrigin: true,
      ws: true,
      pathRewrite: { '^': '' },
    },
  },
};
