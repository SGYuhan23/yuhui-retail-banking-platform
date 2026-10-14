import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Select, Space, Alert, Tag } from 'antd';
import { api, perform, money, labels, notice, options } from './shared';
/** Integrated into existing home and wallet; no separate customer homepage. */
export default function Consumer({ wallet = false }: { wallet?: boolean }) {
  const [customer, setCustomer] = useState(
      new URLSearchParams(location.search).get('customer') ||
        localStorage.getItem('v3-demo-customer') ||
        '',
    ),
    [active, setActive] = useState(customer),
    [offers, setOffers] = useState<any[]>([]),
    [items, setItems] = useState<any[]>([]),
    [merchants, setMerchants] = useState<Record<number, number>>({});
  const load = async () => {
    if (!active) {
      setOffers([]);
      setItems([]);
      return;
    }
    const result = await Promise.all([
      api(`/offers?customerId=${encodeURIComponent(active)}`),
      api(`/wallet?customerId=${encodeURIComponent(active)}`),
    ]);
    setOffers(result[0]);
    setItems(result[1]);
  };
  useEffect(() => {
    if (active) localStorage.setItem('v3-demo-customer', active);
    perform(load);
  }, [active]);
  return (
    <section className="v3-consumer">
      <h2>{wallet ? '场景生活权益钱包' : '为你的生活，添一份权益'}</h2>
      <Alert message="Synthetic / Mock Data" description={notice} type="info" />
      <p>选择合成客户体验 V3 活动（原有积分与抽奖仍使用原体验账户）。此选择器仅供本地演示。</p>
      <Space wrap>
        <Input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="从客群快照复制 SYN 客户编号"
          style={{ width: 320 }}
        />
        <Button
          onClick={() => {
            localStorage.setItem('v3-demo-customer', customer);
            setActive(customer);
          }}
        >
          切换演示客户
        </Button>
        <Button onClick={() => perform(load)}>刷新权益</Button>
      </Space>
      {!wallet && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20 }}>
          {offers.map((o) => (
            <Card key={o.run_id} title={o.benefit.name} style={{ width: 340 }}>
              <p>{o.name}</p>
              <p>
                权益面值 {money(o.benefit.face_value)} · 消费满 {money(o.benefit.minimum_spend)}{' '}
                可用
              </p>
              <p>领取后 {o.benefit.valid_days} 天有效，每批次限领一次。</p>
              <Select
                placeholder="选择适用商户"
                style={{ width: '100%' }}
                options={options(o.merchants)}
                value={merchants[o.run_id]}
                onChange={(v) => setMerchants({ ...merchants, [o.run_id]: v })}
              />
              <Button
                style={{ marginTop: 16 }}
                type="primary"
                disabled={!merchants[o.run_id] || items.some((e) => e.campaign_run_id === o.run_id)}
                onClick={() =>
                  perform(async () => {
                    await api(`/runs/${o.run_id}/events`, 'POST', {
                      customer_id: active,
                      event_type: 'DELIVERED',
                    });
                    await api(`/runs/${o.run_id}/events`, 'POST', {
                      customer_id: active,
                      event_type: 'PARTICIPATED',
                    });
                    await api(`/runs/${o.run_id}/claim`, 'POST', {
                      customer_id: active,
                      merchant_id: merchants[o.run_id],
                    });
                  }, load)
                }
              >
                {items.some((e) => e.campaign_run_id === o.run_id)
                  ? '已领取，请到我的权益查看'
                  : o.benefit.points_price
                  ? `${o.benefit.points_price} 积分兑换`
                  : '领取生活权益'}
              </Button>
            </Card>
          ))}
        </div>
      )}
      {!wallet && !offers.length && (
        <p>当前没有可参与的 V3 活动。请先在运营端发布适用该客户的活动并创建批次。</p>
      )}
      {wallet && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20 }}>
          {items.map((e) => (
            <Card key={e.code} title={e.terms.name} style={{ width: 350 }}>
              <Tag>{labels[e.status]}</Tag>
              <p>适用商户：{e.terms.merchant.name}</p>
              <p>适用场景：{labels[e.terms.scene_id]}</p>
              <p>
                消费满 {money(e.terms.minimum_spend)} 可用，有效期至 {e.expires_at}
              </p>
              <p>
                模拟核销码：<strong>{e.code}</strong>
              </p>
              {e.points_spent > 0 && <p>已使用 {e.points_spent} 合成积分；取消退还，逾期不退。</p>}
              {e.status === 'AVAILABLE' && (
                <Button
                  onClick={() =>
                    perform(
                      () => api('/cancel', 'POST', { code: e.code, customer_id: active }),
                      load,
                    )
                  }
                >
                  取消未使用权益
                </Button>
              )}
            </Card>
          ))}
          {!items.length && <p>该合成客户还没有场景权益。</p>}
        </div>
      )}
    </section>
  );
}
