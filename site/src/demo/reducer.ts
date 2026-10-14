export const storageKey = "yuhui-pages-demo-v1";
export type DemoState = {
  guideStep: number;
  viewMode: string;
  campaignStatus: string;
  reviewStatus: string;
  published: boolean;
  claimStatus: string;
  redemptionStatus: string;
  fulfillmentStatus: string;
  decision: string;
  selectedSection: string;
  changed: boolean;
  notice: string;
};
export const initialState: DemoState = {
  guideStep: 0,
  viewMode: "经营端",
  campaignStatus: "草稿",
  reviewStatus: "未提交",
  published: false,
  claimStatus: "可领取",
  redemptionStatus: "未核销",
  fulfillmentStatus: "未开始",
  decision: "",
  selectedSection: "overview",
  changed: false,
  notice: "",
};
export type Action = {
  type:
    | "navigate"
    | "submit"
    | "approve"
    | "change"
    | "restore"
    | "publish"
    | "claim"
    | "redeem"
    | "end"
    | "settle"
    | "decision"
    | "reset";
  value?: string;
  step?: number;
};
export function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case "reset":
      return { ...initialState };
    case "navigate":
      return {
        ...s,
        selectedSection: a.value!,
        guideStep: a.step ?? 0,
        viewMode:
          a.value === "wallet"
            ? "客户视角"
            : a.value === "redemption"
              ? "商户视角"
              : "经营端",
        notice: "",
      };
    case "submit":
      return s.published
        ? s
        : {
            ...s,
            reviewStatus: "待复核",
            campaignStatus: "待复核",
            changed: false,
            notice: "已提交固定配置，等待复核。",
          };
    case "approve":
      return s.reviewStatus === "待复核"
        ? {
            ...s,
            reviewStatus: "已通过",
            campaignStatus: "已通过",
            notice: "复核通过。发布前仍会校验关键配置。",
          }
        : s;
    case "change":
      return s.reviewStatus === "已通过" && !s.published
        ? {
            ...s,
            changed: true,
            notice: "已模拟关联规则发生变化；原审核不能继续用于发布。",
          }
        : s;
    case "restore":
      return {
        ...s,
        changed: false,
        reviewStatus: "待复核",
        campaignStatus: "待复核",
        notice: "已恢复固定方案并重新提交，请再次复核。",
      };
    case "publish":
      if (s.published) return s;
      if (s.changed)
        return {
          ...s,
          reviewStatus: "需重新复核",
          campaignStatus: "草稿",
          notice: "发布已拦截：关键配置有变化，需要重新复核。",
        };
      return s.reviewStatus === "已通过"
        ? {
            ...s,
            published: true,
            campaignStatus: "已发布",
            fulfillmentStatus: "进行中",
            notice: "关键配置已冻结，本次投放将使用该发布版本。",
          }
        : s;
    case "claim":
      return s.published &&
        s.campaignStatus === "已发布" &&
        s.claimStatus === "可领取"
        ? {
            ...s,
            claimStatus: "已领取",
            notice: "领取成功。对应银行预算先进入预占，还没有形成实际成本。",
          }
        : s;
    case "redeem":
      if (s.redemptionStatus === "已核销")
        return { ...s, notice: "已核销，不重复扣减" };
      return s.claimStatus === "已领取"
        ? {
            ...s,
            redemptionStatus: "已核销",
            notice:
              "核销成功：只有真正核销后，这部分预算才从预占变成实际成本。",
          }
        : s;
    case "end":
      return s.redemptionStatus === "已核销"
        ? {
            ...s,
            campaignStatus: "停止投放",
            fulfillmentStatus: "进行中",
            notice: "停止继续发放，已领取权益继续核销或到期。",
          }
        : s;
    case "settle":
      return s.campaignStatus === "停止投放"
        ? {
            ...s,
            fulfillmentStatus: "履约完成",
            notice:
              "案例履约已完成：已核销权益计入实际成本，未使用到期权益释放预占预算。",
          }
        : s;
    case "decision":
      return s.fulfillmentStatus === "履约完成" &&
        ["扩大", "保持", "缩减", "停止"].includes(a.value ?? "")
        ? {
            ...s,
            decision: a.value!,
            notice: "已记录本次复盘时的指标快照。仅保存在当前浏览器。",
          }
        : s;
  }
}
export function loadState(): DemoState {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      s &&
      Object.keys(initialState).every(
        (k) => typeof s[k] === typeof initialState[k as keyof DemoState],
      )
    )
      return s;
  } catch {}
  return { ...initialState };
}
export function budget(s: DemoState) {
  if (s.fulfillmentStatus === "履约完成")
    return {
      total: 600000,
      reserved: 0,
      committed: 330000,
      released: 270000,
      available: 270000,
    };
  const claimed = s.claimStatus === "已领取",
    redeemed = s.redemptionStatus === "已核销";
  return {
    total: 600000,
    reserved: claimed && !redeemed ? 1200 : 0,
    committed: redeemed ? 1200 : 0,
    released: 0,
    available: 600000 - (claimed ? 1200 : 0),
  };
}
