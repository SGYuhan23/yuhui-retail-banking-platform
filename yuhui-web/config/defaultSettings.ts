import { ProLayoutProps } from '@ant-design/pro-components';

const settings: ProLayoutProps & {
  logo?: string;
} = {
  navTheme: 'light',
  splitMenus: false,
  colorPrimary: '#a92e35',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '渝惠积分',
  logo: `${process.env.PAGES_BASE || '/'}assets/bank-mark.svg`,
  iconfontUrl: '',
  token: {},
};

export default settings;
