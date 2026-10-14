import Consumer from '../Operating/Consumer';
import RecordCarousel from '@/components/RecordCarousel';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useModel } from '@umijs/max';
import { Alert, Button, Empty, message, Modal, Pagination, Select, Skeleton } from 'antd';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckOutlined,
  GiftOutlined,
  LockOutlined,
  SwapOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import RewardsShell from '@/components/RewardsShell';
import {
  addLotteryQuota,
  calendarSignRebate,
  creditPayExchangeSku,
  draw,
  isAddLotteryQuota,
  isCalendarSignRebate,
  query_activity,
  query_my_award_record,
  query_user_behavior_gift,
  queryLotteryAwardList,
  querySkuProductListByActivityId,
  queryStrategyRuleWeight,
  queryUserActivityAccount,
  queryUserCreditAccount,
} from '@/services/api';
import styles from './index.less';

type Activity = {
  id: string;
  activityName: string;
  activityDesc: string;
  state: string;
  beginDateTime?: string;
  endDateTime?: string;
};
type Award = {
  awardId: string;
  awardTitle: string;
  image: string;
  sort: number;
  waitUnLockCount: number;
};
type Account = { totalCountSurplus: number; dayCountSurplus: number; monthCountSurplus: number };
type Sku = { id: string; productAmount: number; activityCount?: { totalCount: number } };
type Gift = { id: string; rebateDesc: string; rebateConfig: string };
type RecordItem = {
  userOrderId: string;
  awardId: string;
  awardTitle: string;
  awardTime: string;
  awardState: string;
};
type RecordPage = { items: RecordItem[]; total: number };
type Weight = {
  ruleWeightCount: number;
  userActivityAccountTotalUseCount: number;
  strategyAwards: { awardTitle: string }[];
};
type Snapshot = {
  awards: Award[];
  account: Account | null;
  credit: number;
  signed: boolean;
  gifts: Gift[];
  claimed: string[];
  skus: Sku[];
  records: RecordPage;
  weights: Weight[];
};
const empty: Snapshot = {
  awards: [],
  account: null,
  credit: 0,
  signed: false,
  gifts: [],
  claimed: [],
  skus: [],
  records: { items: [], total: 0 },
  weights: [],
};
async function data<T>(request: Promise<unknown>): Promise<T> {
  const response = (await request) as { code: number; message: string; data: T };
  if (response.code !== 1000) {
    const messages: Record<number, string> = {
      1001: '服务暂时繁忙，请稍后重试',
      1002: '请求参数不完整，请刷新页面重试',
      1005: '这笔操作已经处理，请刷新记录确认',
      1006: '活动暂未开放',
      1007: '当前不在活动时间内',
      1008: '兑换名额已用完',
      1009: '抽奖次数不足',
      1010: '本月可用次数不足',
      1011: '今日可用次数不足',
      1013: '积分不足或账户不可用',
      1014: '活动暂时维护中，请稍后再来',
      1015: '操作过于频繁，请稍后重试',
      2010: '这份福利已经领取',
    };
    throw new Error(messages[response.code] || response.message || '请求失败');
  }
  return response.data;
}
const artKind = (title: string) =>
  /生活券/.test(title)
    ? 'coffee'
    : /周卡/.test(title)
    ? 'cable'
    : /月卡/.test(title)
    ? 'travel'
    : 'gift';
function Art({ kind, className = '' }: { kind: string; className?: string }) {
  return <div aria-hidden="true" className={`${styles.art} ${styles[kind]} ${className}`} />;
}
const date = (value: string, full = false) => {
  if (!value) return '';
  const d = new Date(/^\d+$/.test(String(value)) ? Number(value) : value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('zh-CN', {
        ...(full ? { year: 'numeric' as const } : {}),
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export default function Experience() {
  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.userId;
  const [toast, contextHolder] = message.useMessage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState('');
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [exchange, setExchange] = useState<Sku>();
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState<{ awardId: string; awardTitle: string }>();
  const [panel, setPanel] = useState<'rules' | 'history' | null>(null);
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState<RecordPage>({ items: [], total: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyRetry, setHistoryRetry] = useState(0);
  useEffect(() => {
    if (panel !== 'history' || !activityId || !userId) return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError('');
    data<RecordPage>(query_my_award_record(String(page), '6', activityId, userId))
      .then((value) => {
        if (!cancelled) setHistoryPage(value);
      })
      .catch(() => {
        if (!cancelled) setHistoryError('记录加载失败，请重试');
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [panel, page, activityId, userId, historyRetry]);
  const alive = useRef(true),
    generation = useRef(0),
    actionLock = useRef(false),
    animation = useRef<ReturnType<typeof setInterval>>();
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
      clearInterval(animation.current);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);
  const initialLoad = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = await data<Activity[]>(query_activity());
      if (!alive.current) return;
      const open = all.filter((a) => a.state === 'open');
      setActivities(open);
      setActivityId(open[0]?.id || '');
      if (!open.length) setLoading(false);
    } catch (e) {
      if (alive.current) {
        setError(e instanceof Error ? e.message : '活动加载失败');
        setLoading(false);
      }
    }
  }, []);
  useEffect(() => {
    initialLoad();
  }, [initialLoad]);
  const refresh = useCallback(async () => {
    if (!activityId || !userId) return;
    const current = ++generation.current;
    const args = { activityId, userId };
    try {
      const [awards, account, credit, signed, gifts, skus, records, weights] = await Promise.all([
        data<Award[]>(queryLotteryAwardList(args)),
        data<Account | null>(queryUserActivityAccount(args)),
        data<number>(queryUserCreditAccount(args)),
        data<boolean>(isCalendarSignRebate(args)),
        data<Gift[]>(query_user_behavior_gift(activityId)),
        data<Sku[]>(querySkuProductListByActivityId(activityId)),
        data<RecordPage>(query_my_award_record('1', '12', activityId, userId)),
        data<Weight[]>(queryStrategyRuleWeight(args)),
      ]);
      const statuses = await Promise.all(
        (gifts || []).map(async (gift) => ({
          id: gift.id,
          claimed: await data<boolean>(isAddLotteryQuota({ ...args, behaviorRebateId: gift.id })),
        })),
      );
      if (!alive.current || current !== generation.current) return;
      setSnapshot({
        awards: (awards || []).sort((a, b) => a.sort - b.sort),
        account,
        credit: Number(credit || 0),
        signed,
        gifts: gifts || [],
        claimed: statuses.filter((x) => x.claimed).map((x) => x.id),
        skus: (skus || []).sort((a, b) => a.productAmount - b.productAmount),
        records: records || { items: [], total: 0 },
        weights: weights || [],
      });
      setError('');
    } catch (e) {
      if (alive.current && current === generation.current)
        setError(e instanceof Error ? e.message : '数据暂时无法加载');
    } finally {
      if (alive.current && current === generation.current) setLoading(false);
    }
  }, [activityId, userId]);
  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setLoading(true);
    setSnapshot(empty);
    refresh();
  }, [refresh]);
  const refreshAfterAction = () => {
    refresh();
    [900, 2500, 7000].forEach((delay) =>
      timeouts.current.push(
        setTimeout(() => {
          if (alive.current) refresh();
        }, delay),
      ),
    );
  };
  async function mutate(key: string, action: () => Promise<unknown>, success: string) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(key);
    try {
      await data(action());
      if (alive.current) {
        toast.success(success);
        refreshAfterAction();
      }
    } catch (e) {
      if (alive.current) toast.error(e instanceof Error ? e.message : '操作失败，请重试');
    } finally {
      actionLock.current = false;
      if (alive.current) setBusy('');
    }
  }
  const args = { activityId, userId };
  const chance = Math.max(
    0,
    Math.min(
      snapshot.account?.dayCountSurplus || 0,
      snapshot.account?.monthCountSurplus || 0,
      snapshot.account?.totalCountSurplus || 0,
    ),
  );
  async function startDraw() {
    if (actionLock.current || !chance) return;
    actionLock.current = true;
    setBusy('draw');
    setActive(0);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      let step = 0;
      animation.current = setInterval(
        () => setActive(++step % Math.max(snapshot.awards.length, 1)),
        100,
      );
    }
    try {
      const win = await data<{ awardId: string; awardTitle: string }>(draw(args));
      if (!alive.current) return;
      if (!reduced)
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 1300);
        });
      if (!alive.current) return;
      clearInterval(animation.current);
      setActive(snapshot.awards.findIndex((a) => String(a.awardId) === String(win.awardId)));
      setResult(win);
      refreshAfterAction();
    } catch (e) {
      if (alive.current) toast.error(e instanceof Error ? e.message : '抽奖失败，请稍后重试');
    } finally {
      clearInterval(animation.current);
      actionLock.current = false;
      if (alive.current) setBusy('');
    }
  }
  const sign = () =>
    mutate('sign', () => calendarSignRebate(args), '签到成功，积分和抽奖机会正在到账');
  const activity = activities.find((a) => a.id === activityId);
  const placements = [0, 1, 2, 7, -1, 3, 6, 5, 4];
  const title = activity?.activityName?.replace('渝惠生活 · ', '') || '积分好礼季';
  return (
    <RewardsShell>
      {contextHolder}
      <div className={styles.greeting}>
        <span>把日常，过成好时光。</span>
        <span>重庆 · 城市生活权益</span>
      </div>
      <section className={styles.heroRow} aria-label="积分概览">
        <div className={styles.hero}>
          <img src="/assets/chongqing-hero-v2.png" alt="山城楼宇、跨江大桥与红色索道" />
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>REWARDS FOR EVERYDAY JOY</span>
            <h1>
              积分有礼，
              <br />
              <em>悦享山城。</em>
            </h1>
            <p>每一份积累，都值得一份小美好。</p>
            <a className={styles.primary} href="#lottery">
              探索本期好礼 <ArrowRightOutlined />
            </a>
          </div>
          <span className={styles.cityStamp}>山水之间 · 惠享生活</span>
        </div>
        <aside className={styles.account}>
          <span>
            我的积分 <WalletOutlined />
          </span>
          <strong>
            {loading ? '—' : snapshot.credit.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
          </strong>
          <small>可用积分 · 签到积累，悦享好礼</small>
          <div className={styles.accountStats}>
            <div>
              <span>可用抽奖机会</span>
              <b>
                {loading ? '—' : chance}
                <small> 次</small>
              </b>
            </div>
            <div>
              <span>今日签到</span>
              <b className={styles.signState}>
                {loading ? '—' : snapshot.signed ? '已完成' : '待签到'}
              </b>
            </div>
          </div>
          <button
            type="button"
            onClick={sign}
            disabled={loading || !!busy || snapshot.signed || !activityId}
          >
            {snapshot.signed ? <CheckOutlined /> : <CalendarOutlined />}{' '}
            {busy === 'sign'
              ? '签到中…'
              : snapshot.signed
              ? '今日已签到，明天再来'
              : '今日签到领取福利'}
          </button>
        </aside>
      </section>
      <Consumer />
      {error && (
        <Alert
          className={styles.error}
          type="error"
          showIcon
          message="加载遇到问题"
          description={error}
          action={
            <Button onClick={() => (activityId ? refresh() : initialLoad())}>重新加载</Button>
          }
        />
      )}
      {!loading && !activities.length && !error && (
        <Empty description="暂无开放中的活动，请稍后再来" />
      )}
      <section className={styles.contentRow}>
        <div className={styles.lotterySection} id="lottery">
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>A LITTLE LUCK, A LOT OF JOY</span>
              <h2>{title}</h2>
            </div>
            <button type="button" className={styles.textButton} onClick={() => setPanel('rules')}>
              活动规则 <ArrowRightOutlined />
            </button>
          </div>
          {activities.length > 1 && (
            <Select
              aria-label="选择活动"
              value={activityId}
              disabled={!!busy}
              onChange={(value) => {
                generation.current++;
                setActivityId(value);
                setPage(1);
                setActive(-1);
              }}
              options={activities.map((a) => ({ value: a.id, label: a.activityName }))}
            />
          )}
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div className={styles.lotteryInner}>
              <div>
                <div className={styles.board} aria-label="本期奖品与抽奖">
                  {placements.map((awardIndex, cell) =>
                    awardIndex === -1 ? (
                      <button
                        type="button"
                        key="draw"
                        className={styles.drawButton}
                        disabled={!!busy || !chance || !snapshot.awards.length}
                        onClick={startDraw}
                      >
                        <GiftOutlined />
                        <strong>{busy === 'draw' ? '好礼揭晓中' : '立即抽奖'}</strong>
                        <span>{chance ? `剩余 ${chance} 次` : '完成任务获取机会'}</span>
                      </button>
                    ) : (
                      (() => {
                        const award = snapshot.awards[awardIndex];
                        return (
                          <div
                            key={cell}
                            className={`${styles.prize} ${
                              active === awardIndex ? styles.selected : ''
                            } ${award?.waitUnLockCount > 0 ? styles.locked : ''}`}
                          >
                            {award ? (
                              <>
                                <Art kind={artKind(award.awardTitle)} />
                                <strong>{award.awardTitle}</strong>
                                <span>
                                  {award.waitUnLockCount > 0 ? (
                                    <>
                                      <LockOutlined /> 再抽 {award.waitUnLockCount} 次解锁
                                    </>
                                  ) : award.awardTitle === '谢谢参与' ? (
                                    '期待下一份惊喜'
                                  ) : (
                                    '本期活动好礼'
                                  )}
                                </span>
                              </>
                            ) : (
                              <span>好礼筹备中</span>
                            )}
                          </div>
                        );
                      })()
                    ),
                  )}
                </div>
                <p className={styles.boardNote}>
                  <span className={styles.dot} /> 每次消耗 1 次机会 · 结果以实际抽奖为准
                </p>
              </div>
              <div className={styles.exchange} id="exchange">
                <h3>用积分，兑换小期待</h3>
                <p>将日常的积累，变成下一份惊喜。</p>
                <div className={styles.exchangeList}>
                  {snapshot.skus.map((sku, i) => (
                    <div className={styles.exchangeItem} key={sku.id}>
                      <span className={styles.packageIcon}>
                        <GiftOutlined />
                      </span>
                      <div>
                        <b>{sku.activityCount?.totalCount} 次抽奖机会</b>
                        <span>
                          {sku.productAmount} 积分 {i === 0 && <small>轻松兑换</small>}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!!busy || snapshot.credit < sku.productAmount}
                        title={
                          snapshot.credit < sku.productAmount
                            ? '积分不足，先完成每日签到'
                            : '兑换抽奖机会'
                        }
                        onClick={() => setExchange(sku)}
                      >
                        {busy === `sku-${sku.id}` ? '处理中' : '兑换'}
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.exchangeFoot}>
                  <SwapOutlined />
                  <span>积分与次数变动，可在运营工作台追溯。</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <aside className={styles.tasks}>
          <div className={styles.sectionHead}>
            <h2>我的任务</h2>
            <span className={styles.taskTag}>每日小积累</span>
          </div>
          <div className={styles.task}>
            <span className={`${styles.taskIcon} ${styles.sage}`}>
              <CalendarOutlined />
            </span>
            <div>
              <h3>每日签到</h3>
              <p>签到领取积分与抽奖机会</p>
              <button
                type="button"
                disabled={!!busy || loading || snapshot.signed || !activityId}
                onClick={sign}
              >
                {snapshot.signed ? (
                  <>
                    <CheckOutlined /> 今日已完成
                  </>
                ) : busy === 'sign' ? (
                  '签到中…'
                ) : (
                  '去签到'
                )}
              </button>
            </div>
          </div>
          {snapshot.gifts.map((g) => (
            <div className={styles.task} key={g.id}>
              <span className={styles.taskIcon}>
                <GiftOutlined />
              </span>
              <div>
                <h3>新客见面礼</h3>
                <p>{g.rebateDesc}</p>
                <button
                  type="button"
                  disabled={!!busy || snapshot.claimed.includes(g.id)}
                  onClick={() =>
                    mutate(
                      `gift-${g.id}`,
                      () => addLotteryQuota({ ...args, behaviorRebateId: g.id }),
                      '领取成功，抽奖机会正在到账',
                    )
                  }
                >
                  {snapshot.claimed.includes(g.id) ? (
                    <>
                      <CheckOutlined /> 已领取
                    </>
                  ) : busy === `gift-${g.id}` ? (
                    '领取中…'
                  ) : (
                    '领取好礼'
                  )}
                </button>
              </div>
            </div>
          ))}
          <div className={styles.task}>
            <span className={`${styles.taskIcon} ${styles.sage}`}>
              <WalletOutlined />
            </span>
            <div>
              <h3>好礼妥善收藏</h3>
              <p>生活权益到账后，在这里查看</p>
              <a href="/wallet">
                打开我的权益 <ArrowRightOutlined />
              </a>
            </div>
          </div>
          <div className={styles.taskQuote}>
            <span>生活在重庆</span>
            <p>每天都有新的期待。</p>
            <small>YUHUI · EVERYDAY MOMENTS</small>
          </div>
        </aside>
      </section>
      <section className={styles.history}>
        <div className={styles.sectionHead}>
          <div className={styles.inlineTitle}>
            <h2>我的参与记录</h2>
            <span>最近 12 条参与结果，可查看全部记录</span>
          </div>
          <button type="button" className={styles.textButton} onClick={() => setPanel('history')}>
            全部记录 <ArrowRightOutlined />
          </button>
        </div>
        {loading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : snapshot.records.items.length ? (
          <RecordCarousel
            items={snapshot.records.items}
            renderItem={(record) => (
              <div className={styles.historyItem}>
                <Art kind={artKind(record.awardTitle)} />
                <div>
                  <b>{record.awardTitle}</b>
                  <span>{date(record.awardTime)}</span>
                </div>
                <small>
                  {record.awardTitle === '谢谢参与'
                    ? '未中奖'
                    : record.awardState === 'complete'
                    ? '已到账'
                    : '发放中'}
                </small>
              </div>
            )}
          />
        ) : (
          <div className={styles.emptyHistory}>
            <GiftOutlined />
            <span>幸运故事，从你的第一次参与开始。</span>
            <a href="#lottery">
              去探索 <ArrowRightOutlined />
            </a>
          </div>
        )}
      </section>
      <Modal
        open={!!exchange}
        title="确认积分兑换"
        okText="确认兑换"
        cancelText="暂不兑换"
        confirmLoading={!!busy}
        onCancel={() => {
          if (!busy) setExchange(undefined);
        }}
        onOk={async () => {
          if (!exchange) return;
          await mutate(
            `sku-${exchange.id}`,
            () => creditPayExchangeSku({ ...args, sku: exchange.id }),
            '兑换成功，抽奖机会正在到账',
          );
          if (alive.current) setExchange(undefined);
        }}
      >
        <p>
          使用 <strong>{exchange?.productAmount} 积分</strong>，兑换{' '}
          <strong>{exchange?.activityCount?.totalCount} 次抽奖机会</strong>。
        </p>
        <p>
          当前可用积分 {snapshot.credit}
          。兑换成功后扣除积分，抽奖次数异步到账，中奖结果以实际抽奖为准。
        </p>
      </Modal>
      <Modal
        open={panel === 'rules'}
        onCancel={() => setPanel(null)}
        footer={<Button onClick={() => setPanel(null)}>我知道了</Button>}
        title="活动规则"
      >
        <div className={styles.rules}>
          <h3>{activity?.activityName}</h3>
          <p>{activity?.activityDesc}</p>
          <p>
            活动时间：{date(activity?.beginDateTime || '', true)} 至{' '}
            {date(activity?.endDateTime || '', true)}
          </p>
          <ol>
            <li>每日签到与活动见面礼可领取相应福利，同一奖励不可重复领取。</li>
            <li>积分兑换成功后获得抽奖次数；每次抽奖消耗 1 次可用机会。</li>
            <li>部分奖品需达到页面所示的当日参与次数后解锁；解锁不代表保证中奖。</li>
            <li>积分和次数异步入账，生活权益可在「我的权益」查看并模拟使用。</li>
          </ol>
          {snapshot.weights.map((w) => (
            <p key={w.ruleWeightCount}>
              累计参与达到 {w.ruleWeightCount} 次，进入{' '}
              {w.strategyAwards.map((a) => a.awardTitle).join('、')} 的指定奖品范围。
            </p>
          ))}
          <p>个人项目演示，所有权益均不具有实际消费价值。</p>
        </div>
      </Modal>
      <Modal
        open={panel === 'history'}
        onCancel={() => {
          setPanel(null);
          setPage(1);
        }}
        footer={null}
        title="我的参与记录"
      >
        {historyError ? (
          <Alert
            type="error"
            message={historyError}
            action={<Button onClick={() => setHistoryRetry((i) => i + 1)}>重试</Button>}
          />
        ) : historyLoading ? (
          <Skeleton active />
        ) : historyPage.items.length ? (
          historyPage.items.map((r, i) => (
            <div className={styles.historyItem} key={`${r.userOrderId}-${i}`}>
              <Art kind={artKind(r.awardTitle)} />
              <div>
                <b>{r.awardTitle}</b>
                <span>{date(r.awardTime)}</span>
              </div>
              <small>
                {r.awardTitle === '谢谢参与'
                  ? '未中奖'
                  : r.awardState === 'complete'
                  ? '已到账'
                  : '发放中'}
              </small>
            </div>
          ))
        ) : (
          <Empty description="暂无参与记录" />
        )}
        <Pagination
          size="small"
          current={page}
          pageSize={6}
          total={historyPage.total}
          onChange={setPage}
          showSizeChanger={false}
        />
      </Modal>
      <Modal
        open={!!result}
        onCancel={() => {
          setResult(undefined);
          setActive(-1);
        }}
        footer={null}
        centered
        width={390}
      >
        <div className={styles.result}>
          <Art kind={artKind(result?.awardTitle || '')} />
          <span>YOUR LITTLE MOMENT OF JOY</span>
          <h2>{result?.awardTitle === '谢谢参与' ? '下一次，继续期待' : '好礼已揭晓'}</h2>
          <h3>{result?.awardTitle}</h3>
          <p>本次结果已记录，可在参与记录中查看状态。</p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              setResult(undefined);
              setActive(-1);
            }}
          >
            继续探索 <ArrowRightOutlined />
          </button>
        </div>
      </Modal>
    </RewardsShell>
  );
}
