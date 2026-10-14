import React, { useState } from 'react';
import { Button, Card, InputNumber, Modal, Alert } from 'antd';
import { api, Shell, perform } from './shared';
export default function Settings() {
  const [seed, setSeed] = useState(202610),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState<any>();
  return (
    <Shell title="系统配置" subtitle="演示数据维护与历史技术配置。">
      <Card title="固定种子 Demo">
        <Alert
          type="warning"
          message="重置会删除全部 V3 客群、活动、权益、流水和决策，重新生成固定案例；旧积分与抽奖记录不受影响。"
        />
        <p>
          固定基准时间：2026-10-01。默认 30,000 客户、12 商户、4 场景、4 客群及 1 个已结束案例。
        </p>
        <InputNumber value={seed} onChange={(v) => setSeed(v ?? 202610)} />
        <Button
          danger
          loading={busy}
          onClick={() =>
            Modal.confirm({
              title: '确认重置 V3 演示数据？',
              content: '此操作清除当前所有 V3 演示操作记录。',
              onOk: async () => {
                setBusy(true);
                try {
                  await perform(async () =>
                    setResult(
                      await api('/demo/reset', 'POST', { seed, confirmation: 'RESET_V3_DEMO' }),
                    ),
                  );
                } finally {
                  setBusy(false);
                }
              },
            })
          }
        >
          重置演示数据
        </Button>
        {result && (
          <p>
            已生成 {result.customers} 名客户；案例批次 #{result.run_id}。
          </p>
        )}
      </Card>
    </Shell>
  );
}
