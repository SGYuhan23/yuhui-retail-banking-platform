import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;
const pagesDemo = process.env.PAGES_DEMO === 'true';
const pagesBase = pagesDemo ? (process.env.PAGES_BASE || '/yuhui-retail-banking-platform/') : '/';

export default defineConfig({
  hash: true,
  base: pagesBase,
  publicPath: pagesBase,
  define: {
    'process.env.REPLICA_LOCAL': process.env.REPLICA_LOCAL === 'true',
    'process.env.PAGES_DEMO': pagesDemo,
    'process.env.PAGES_BASE': pagesBase,
  },
  routes,
  theme: {
    'root-entry-name': 'variable',
  },
  lessLoader: { modifyVars: { 'site-base': `'${pagesBase}'` } },
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  fastRefresh: true,
  model: {},
  initialState: {},
  title: '渝惠积分｜城市生活权益',
  layout: {
    locale: false,
    ...defaultSettings,
  },
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  antd: {},
  request: {},
  access: {},
  headScripts: [
    {
      src: `${pagesBase}scripts/loading.js`,
      async: true,
    },
  ],
  presets: ['umi-presets-pro'],
  mfsu: {
    strategy: 'normal',
  },
  esbuildMinifyIIFE: true,
});
