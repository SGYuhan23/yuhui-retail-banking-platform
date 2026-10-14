import { Card, Statistic, Descriptions } from "antd";
import { fixtures as f, money } from "../demo/fixtures";
export function Funnel() {
  return (
    <div className="funnel">
      {f.funnel.map(([label, n]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{n.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}
export function BudgetCards({
  data,
}: {
  data: {
    total: number;
    reserved: number;
    committed: number;
    released: number;
    available: number;
  };
}) {
  return (
    <div className="metrics">
      {(
        ["total", "reserved", "committed", "released", "available"] as const
      ).map((k, i) => (
        <Card key={k}>
          <Statistic
            title={
              ["总预算", "当前预占", "实际成本", "累计释放", "剩余可用"][i]
            }
            value={money(data[k])}
          />
        </Card>
      ))}
    </div>
  );
}
export function Summary() {
  return (
    <Descriptions
      bordered
      column={{ xs: 1, sm: 1, md: 2 }}
      items={[
        ["经营目标", f.campaign.objective],
        ["目标客群", f.segment.name],
        ["生活场景", f.scenes[0]],
        ["权益", f.benefit.name],
        ["银行预算", money(f.campaign.budget)],
        ["预设目标", `${f.campaign.goal} 名客户`],
        ["投放 / 目标观察窗口", `${f.campaign.start} 至 ${f.campaign.end}`],
        [
          "每次核销成本分担",
          `银行 ${money(f.benefit.bankCost)} / 商户 ${money(f.benefit.merchantCost)}`,
        ],
      ].map(([label, children]) => ({ key: label, label, children }))}
    />
  );
}
