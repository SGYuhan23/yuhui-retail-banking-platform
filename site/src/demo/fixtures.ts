import review from "./review.json";
// Names, costs and rules: V3Demo.java. Aggregates: targeted-acceptance.json.
export const fixtures = {
  seed: 202610,
  review,
  campaign: {
    name: "涪陵社区生活场景｜沉默客户唤醒计划",
    objective: "客户唤醒",
    start: "2026-10-01 00:00:00",
    end: "2026-10-12 23:59:59",
    target: "观察窗口内完成模拟社区消费",
    budget: 600000,
    goal: 150,
  },
  segment: {
    name: "沉默高积分客户",
    count: 2166,
    rules: [
      ["地区", "涪陵"],
      ["距上次活跃", "60–180 天"],
      ["积分余额", "≥ 2000"],
      ["场景偏好", "社区生活"],
      ["营销许可", "已许可"],
    ],
  },
  // Customer identifier is present in the genuine wallet screenshot; no invented attributes.
  customers: [{ id: "SYN00022", source: "真实钱包截图中的合成客户" }],
  scenes: ["社区生活", "餐饮消费", "山城文旅", "乡村 / 重庆特色消费"],
  merchants: [
    "渝邻便利（虚构）",
    "山城早餐铺（虚构）",
    "邻里生鲜（虚构）",
    "江畔小铺（虚构）",
    "桥头生活社（虚构）",
    "山城茶馆（虚构）",
    "邻里杂货（虚构）",
    "江岸便民店（虚构）",
    "山城小餐桌（虚构）",
    "云岭漫游（虚构）",
    "乡里优选（虚构）",
    "江畔咖啡（虚构）",
  ].map((name, i) => ({
    name,
    scene:
      i < 8
        ? "社区生活"
        : ["餐饮消费", "山城文旅", "乡村 / 重庆特色消费"][(i - 8) % 3],
    district: "涪陵",
  })),
  benefit: {
    name: "20元社区生活权益",
    face: 2000,
    minSpend: 4000,
    bankCost: 1200,
    merchantCost: 800,
    days: 7,
  },
  replay: {
    claimAt: "2026-10-01 10:02",
    expiresAt: "2026-10-08 10:02",
    redeemAt: "2026-10-02 10:00",
    releaseAt: "2026-10-12 10:00",
  },
  decisions: ["扩大", "保持", "缩减", "停止"],
  funnel: [
    ["目标客群", 2166],
    ["触达", 1563],
    ["参与", 964],
    ["领取", 500],
    ["核销", 275],
    ["目标行为", 224],
  ] as const,
  targetExplanation:
    "目标完成率 = 观察结果 224 ÷ 预设目标 150 = 149.3%；不是活跃提升，也不代表营销因果效果。",
};
export const money = (n: number) =>
  `¥${(n / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const source =
  "https://github.com/SGYuhan23/yuhui-retail-banking-platform";
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
