import React, { useEffect, useRef, useState } from 'react';
import { request } from '@umijs/max';
import { Button, Alert, message, Skeleton, Modal } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import RewardsShell from '@/components/RewardsShell';
import art from '../Experience/index.less';
import styles from './index.less';
type Benefit = {
  id: string;
  title: string;
  quantity: string;
  createdAt: string;
  redeemedAt: string | null;
};
export default function Wallet() {
  const [items, setItems] = useState<Benefit[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [filter, setFilter] = useState('available'),
    [selected, setSelected] = useState<Benefit>();
  const [api, holder] = message.useMessage();
  const alive = useRef(true);
  const lock = useRef(false);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await request('/api/v1/local/wallet');
      if (r.code !== 1000) throw Error(r.message);
      if (alive.current) setItems(r.data);
    } catch {
      if (alive.current) setError(true);
    } finally {
      if (alive.current) setLoading(false);
    }
  };
  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, []);
  const redeem = async () => {
    if (!selected || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const r = await request('/api/v1/local/wallet/redeem', {
        method: 'POST',
        data: { orderId: selected.id },
      });
      if (r.code === 1000) {
        api.success(r.message);
        setSelected(undefined);
        await load();
      } else {
        api.warning(r.message);
        setSelected(undefined);
        await load();
      }
    } catch {
      api.error('核销失败，请稍后重试');
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const visible = items.filter(
    (i) => filter === 'all' || (filter === 'available' ? !i.redeemedAt : !!i.redeemedAt),
  );
  return (
    <RewardsShell active="wallet">
      {holder}
      <div className={styles.heading}>
        <span>MY EVERYDAY REWARDS</span>
        <h1>
          好礼已至，<em>生活有期。</em>
        </h1>
        <p>每一份积分换来的小美好，都为你妥善收藏。</p>
      </div>
      <div className={styles.summary}>
        <div>
          <WalletOutlined />
          <span>
            待使用权益<strong>{loading ? '—' : items.filter((i) => !i.redeemedAt).length}</strong>
          </span>
        </div>
        <div>
          <CheckCircleOutlined />
          <span>
            已使用权益<strong>{loading ? '—' : items.filter((i) => !!i.redeemedAt).length}</strong>
          </span>
        </div>
        <a href="/experience">
          探索更多好礼 <ArrowRightOutlined />
        </a>
      </div>
      <div className={styles.filters} role="group" aria-label="权益状态">
        {[
          ['available', '待使用'],
          ['redeemed', '已使用'],
          ['all', '全部权益'],
        ].map(([key, label]) => (
          <button type="button"
            key={key}
            aria-pressed={filter === key}
            className={filter === key ? styles.active : ''}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? (
        <Alert type="error" message="权益加载失败" action={<Button onClick={load}>重试</Button>} />
      ) : loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !visible.length ? (
        <div className={styles.empty}>
          <div className={`${art.art} ${art.coffee}`} />
          <h2>{items.length ? '这里还没有符合条件的权益' : '生活的小惊喜，正在路上'}</h2>
          <p>
            {items.length
              ? '切换权益状态，查看你的其他好礼。'
              : '参与积分活动，赢取的生活权益将在这里与你见面。'}
          </p>
          <a className={art.primary} href="/experience">
            前往积分专区 <ArrowRightOutlined />
          </a>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((item) => (
            <article className={styles.card} key={item.id}>
              <div
                className={`${art.art} ${/生活券/.test(item.title) ? art.coffee : art.travel}`}
              />
              <div className={styles.cardBody}>
                <span className={item.redeemedAt ? styles.used : styles.available}>
                  {item.redeemedAt ? '已使用' : '待使用'}
                </span>
                <h2>{item.title}</h2>
                <p>到账时间 {item.createdAt}</p>
                <small>权益编号 {item.id}</small>
                <div className={styles.cardAction}>
                  {item.redeemedAt ? (
                    <span>
                      <CheckCircleOutlined /> {item.redeemedAt} 已核销
                    </span>
                  ) : (
                    <button type="button"
                      className={art.primary}
                      disabled={busy}
                      onClick={() => setSelected(item)}
                    >
                      模拟使用权益 <ArrowRightOutlined />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className={styles.notice}>
        <GiftOutlined />
        <span>个人项目演示：生活券与出行礼遇仅展示到账和核销流程，不具有实际消费价值。</span>
      </div>
      <Modal
        open={!!selected}
        title="使用这份好礼"
        okText="确认模拟核销"
        cancelText="暂不使用"
        confirmLoading={busy}
        onOk={redeem}
        onCancel={() => {
          if (!busy) setSelected(undefined);
        }}
      >
        <p>{selected?.title}</p>
        <p>本次将核销整份权益；包含多张券时一并标记为已使用，不支持拆分。</p>
        <p>确认后将记录核销时间，并移入「已使用」权益。此次操作为本地模拟。</p>
      </Modal>
    </RewardsShell>
  );
}
