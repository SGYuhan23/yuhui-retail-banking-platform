import React from 'react';
import { sitePath } from '@/utils/sitePath';
import { Link, useLocation } from '@umijs/max';
import { EnvironmentOutlined, AppstoreOutlined, ArrowRightOutlined, MenuOutlined } from '@ant-design/icons';
import styles from './index.less';
export function RewardsHeader({ compact = false, onMenuToggle, menuExpanded }: { compact?: boolean; onMenuToggle?: () => void; menuExpanded?: boolean }) {
  const { pathname } = useLocation();
  return (
    <header className={`${styles.header} ${compact ? styles.compactHeader : ''}`}>
      <div className={styles.headerInner}>
        <Link to="/experience" className={styles.brand}>
          <img src={sitePath("/assets/bank-mark.svg")} alt="" />
          <span>
            渝惠积分<small>YUHUI REWARDS</small>
          </span>
        </Link>
        <nav aria-label="平台导航">
          {onMenuToggle && <button type="button" className={styles.menuToggle} onClick={onMenuToggle} aria-label="打开运营功能菜单" aria-expanded={menuExpanded}><MenuOutlined /> 菜单</button>}
          {[
            ['/experience', '积分首页'],
            ['/wallet', '我的权益'],
            ['/credit/credit_account', '积分管理'],
            ['/rebate/behavior_rebate', '返利管理'],
            ['/strategy/strategy', '策略管理'],
          ].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={pathname.split('/')[1] === path.split('/')[1] ? styles.active : ''}
              aria-current={pathname.split('/')[1] === path.split('/')[1] ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.tools}>
          <Link to="/admin/activity" className={styles.workbench} aria-label="进入运营工作台">
            <AppstoreOutlined /> 运营工作台 <ArrowRightOutlined />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function RewardsShell({
  children,
}: {
  children: React.ReactNode;
  active?: 'home' | 'wallet';
}) {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main-content">
        跳转到主要内容
      </a>
      <RewardsHeader />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>山水之城，美好日常。</span>
        <span>个人项目演示 · 非银行官方服务 · 权益仅用于模拟体验</span>
        <span>
          <EnvironmentOutlined /> 重庆 · CHONGQING
        </span>
      </footer>
    </div>
  );
}
