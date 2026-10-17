import React from 'react';
import { Link, useLocation } from '@umijs/max';
import { EnvironmentOutlined } from '@ant-design/icons';
import styles from './index.less';
export function RewardsHeader({ compact = false }: { compact?: boolean }) {
  const { pathname } = useLocation();
  return (
    <header className={`${styles.header} ${compact ? styles.compactHeader : ''}`}>
      <div className={styles.headerInner}>
        <Link to="/experience" className={styles.brand}>
          <img src="/assets/bank-mark.svg" alt="" />
          <span>
            渝惠积分<small>YUHUI REWARDS</small>
          </span>
        </Link>
        <nav aria-label="平台导航">
          {[
            ['/experience', '积分首页'],
            ['/experience#benefits', '精选权益'],
            ['/wallet', '我的权益'],
          ].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={pathname === path ? styles.active : ''}
              aria-current={pathname === path ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.tools}>
          <Link to="/admin/activity">运营工作台 ↗</Link>
          <span className={styles.avatar} aria-label="体验客户">
            渝
          </span>
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
