import { fixtures as f } from './fixtures';
export const storageKey = "yuhui-pages-demo-v2";
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
  decisionReason: string;
  decisionMetrics: { claimed: number; redeemed: number; bankCost: number; target: number } | null;
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
  decisionReason: "",
  decisionMetrics: null,
  selectedSection: "overview",
  changed: false,
  notice: "",
};
export type Action = {
  type:
    | "load-step"
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
  reason?: string;
};
export function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case "load-step":
      return stageState(a.value ?? "segments");
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
            notice: "方案已提交，等待审核。",
          };
    case "approve":
      return s.reviewStatus === "待复核"
        ? {
            ...s,
            reviewStatus: "已通过",
            campaignStatus: "已通过",
            notice: "审核通过，可以发布。",
          }
        : s;
    case "change":
      return s.reviewStatus === "已通过" && !s.published
        ? {
            ...s,
            changed: true,
            notice: "客群条件已修改，发布时需重新审核。",
          }
        : s;
    case "restore":
      if (s.published) return s;
      return {
        ...s,
        changed: false,
        reviewStatus: "待复核",
        campaignStatus: "待复核",
        notice: "已恢复原方案，请重新审核。",
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
            notice: "活动已发布，名单与方案已锁定。",
          }
        : s;
    case "claim":
      return s.published &&
        s.campaignStatus === "已发布" &&
        s.claimStatus === "可领取"
        ? {
            ...s,
            claimStatus: "已领取",
            notice: "领取成功，银行预算已预留。",
          }
        : s;
    case "redeem":
      if (s.redemptionStatus === "已核销")
        return { ...s, notice: "已核销，不重复扣减" };
      return s.claimStatus === "已领取"
        ? {
            ...s,
            redemptionStatus: "已核销",
            notice: "核销成功，预留预算已计入成本。",
          }
        : s;
    case "end":
      if (s.fulfillmentStatus === "履约完成") return s;
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
              "结算完成：已用券计入成本，到期未用券已释放预算。",
          }
        : s;
    case "decision":
      return s.fulfillmentStatus === "履约完成" &&
        ["扩大", "保持", "缩减", "停止"].includes(a.value ?? "") &&
        !!a.reason?.trim() && a.reason.trim().length <= 3000
        ? {
            ...s,
            decision: a.value!,
            decisionReason: a.reason!.trim(),
            decisionMetrics: { claimed: f.review.funnel.CLAIMED, redeemed: f.review.funnel.REDEEMED, bankCost: f.review.budget.committed, target: f.review.target_actual },
            notice: "已记录本次复盘时的指标快照。仅保存在当前浏览器。",
          }
        : s;
  }
}
export function loadState(key = storageKey): DemoState {
  try {
    const s = JSON.parse(localStorage.getItem(key) || "null");
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
    { const {total,reserved,committed,released,available} = f.review.budget; return {total,reserved,committed,released,available}; }
  const claimed = s.claimStatus === "已领取",
    redeemed = s.redemptionStatus === "已核销";
  return {
    total: f.campaign.budget,
    reserved: claimed && !redeemed ? f.benefit.bankCost : 0,
    committed: redeemed ? f.benefit.bankCost : 0,
    released: 0,
    available: f.campaign.budget - (claimed ? f.benefit.bankCost : 0),
  };
}

// Independent previews enter through the same valid transitions as the full flow.
export function stageState(section: string): DemoState {
  const actions: Action['type'][] = ['submit','approve','publish','claim','redeem','end','settle'];
  const through: Record<string, number> = { segments: 0, campaign: 0, review: 1, wallet: 3, redemption: 4, fulfillment: 6, 'final-review': 7 };
  const state = actions.slice(0,through[section] ?? 0).reduce((s,type)=>reducer(s,{type}),{...initialState});
  return {...state, selectedSection: section, notice: ''};
}
