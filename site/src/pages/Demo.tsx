import { useEffect, useReducer, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Drawer,
  Input,
  Menu,
  Modal,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import {
  MenuOutlined,
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  ShopOutlined,
  WalletOutlined,
  BarChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { fixtures as f, money, asset } from "../demo/fixtures";
import { steps, boundary } from "../demo/copy";
import {
  budget,
  initialState,
  loadState,
  reducer,
  storageKey,
} from "../demo/reducer";
import { BudgetCards, Funnel, Summary } from "../components/Common";
export default function Demo() {
  const [state, dispatch] = useReducer(reducer, initialState, loadState),
    [drawer, setDrawer] = useState(false),
    [modal, setModal] = useState(false),
    [search, setSearch] = useState(""),
    [scene, setScene] = useState("全部"),
    [choice, setChoice] = useState("");
  const location = useLocation(),
    navigate = useNavigate(),
    section = location.pathname.split("/")[2] || "overview";
  const index = steps.findIndex(([key]) => key === section);
  const go = (key: string) => {
    navigate("/demo/" + key);
    setDrawer(false);
  };
  useEffect(() => {
    dispatch({ type: "navigate", value: section, step: Math.max(0, index) });
    window.scrollTo(0, 0);
  }, [section, index]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state]);
  const reset = () => {
    localStorage.removeItem(storageKey);
    dispatch({ type: "reset" });
    setChoice("");
    go("overview");
  };
  const navItems = [
    { key: "overview", icon: <DashboardOutlined />, label: "经营总览" },
    { key: "segments", icon: <TeamOutlined />, label: "客群经营" },
    {
      key: "activity",
      icon: <ProjectOutlined />,
      label: "活动经营",
      children: [{ key: "campaign", label: "经营方案与投放" }],
    },
    { key: "merchants", icon: <ShopOutlined />, label: "商户与权益" },
    {
      key: "finance",
      icon: <WalletOutlined />,
      label: "积分与预算",
      children: [{ key: "budget", label: "预算与流水" }],
    },
    { key: "final-review", icon: <BarChartOutlined />, label: "经营复盘" },
  ];
  const menu = (
    <>
      <Link className="brand sidebar-brand" to="/">
        <img src={asset("bank-mark.svg")} alt="渝惠" />
        渝惠｜零售客户经营
      </Link>
      <Menu
        mode="inline"
        selectedKeys={[section]}
        defaultOpenKeys={["activity", "finance"]}
        items={navItems}
        onClick={({ key }) => go(key)}
      />
      <div className="sidebar-bottom">
        <Link to="/screenshots">真实系统截图 ↗</Link>
        <Link to="/">返回产品首页</Link>
      </div>
    </>
  );
  const stageBudget = budget(state),
    settled = state.fulfillmentStatus === "履约完成";
  const notices = state.notice ? (
    <Alert
      className="notice"
      showIcon
      type={
        state.changed || state.reviewStatus === "需重新复核"
          ? "warning"
          : "success"
      }
      message={state.notice}
    />
  ) : null;
  const requireAction = (label: string, key: string) => (
    <Alert
      type="info"
      showIcon
      message={label}
      action={<Button onClick={() => go(key)}>前往完成</Button>}
    />
  );
  const titles: Record<string, string> = {
    overview: "经营总览",
    segments: "客群经营",
    campaign: "活动经营",
    review: "复核并发布",
    wallet: "场景生活权益钱包",
    redemption: "商户模拟核销",
    fulfillment: "经营复盘 · 履约跟踪",
    "final-review": "经营复盘",
    merchants: "商户与权益",
    budget: "积分与预算",
  };
  let content;
  if (section === "overview")
    content = (
      <>
        <Card>
          <Tag color="green">已完成 · 固定完整案例</Tag>
          <h2>沉默客户社区生活权益经营案例</h2>
          <p>{f.campaign.name}</p>
          <div className="metrics">
            <Statistic title="目标客群" value={2166} />
            <Statistic title="领取" value={500} />
            <Statistic title="核销" value={275} />
            <Statistic title="实际成本" value="¥3300" />
            <Statistic title="目标完成" value="224 / 150" />
          </div>
        </Card>
        <Card title="客户行为漏斗 · 按客户去重">
          <Funnel />
        </Card>
        <Card title="从头体验一次经营活动">
          <p>这套演示会带你从“选哪些客户”走到“活动结束后下一轮怎么决策”。</p>
          <p className="muted">
            先回放一个客户的领取与核销，再推进到完整案例的固定结果；点击不会增加历史汇总数字。
          </p>
          <Button type="primary" onClick={() => go("segments")}>
            从选择客群开始
          </Button>
        </Card>
      </>
    );
  else if (section === "segments")
    content = (
      <>
        <p className="muted">
          轻量规则筛选；发布时冻结实际经营名单，自动排除未许可营销的客户。
        </p>
        <Tabs
          items={[
            {
              key: "rules",
              label: "客群库与规则",
              children: (
                <Card>
                  <div className="section-heading">
                    <h2>{f.segment.name}</h2>
                    <Statistic title="预计可经营人数" value={f.segment.count} />
                  </div>
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 1, md: 2 }}
                    items={f.segment.rules.map(([label, children]) => ({
                      key: label,
                      label,
                      children,
                    }))}
                  />
                  <p>
                    发布时会冻结实际经营名单，后续规则变化不会偷偷影响已经审核通过的活动。
                  </p>
                  <Button onClick={() => setModal(true)}>预览规则与人数</Button>
                </Card>
              ),
            },
            {
              key: "customers",
              label: "合成客户样本",
              children: (
                <Table
                  rowKey="id"
                  pagination={false}
                  dataSource={f.customers}
                  columns={[
                    { title: "合成客户", dataIndex: "id" },
                    { title: "说明", dataIndex: "source" },
                  ]}
                />
              ),
            },
          ]}
        />
        <Button type="primary" onClick={() => go("campaign")}>
          使用该客群制定经营方案
        </Button>
        <Modal
          title="固定客群规则"
          open={modal}
          onCancel={() => setModal(false)}
          footer={<Button onClick={() => setModal(false)}>关闭</Button>}
        >
          <p>全部条件同时满足，营销许可必需。</p>
          {f.segment.rules.map(([k, v]) => (
            <p key={k}>
              {k}：{v}
            </p>
          ))}
          <strong>固定人数：2166</strong>
        </Modal>
      </>
    );
  else if (section === "campaign")
    content = (
      <>
        <Tabs
          items={[
            {
              key: "plan",
              label: "活动方案",
              children: (
                <Card title={f.campaign.name}>
                  <Tag>{state.campaignStatus}</Tag>
                  <Summary />
                  <p>适用商户：前 8 家社区生活合成商户。</p>
                  <Select
                    aria-label="查看经营方案场景"
                    value="社区生活"
                    options={[
                      { value: "社区生活", label: "社区生活 · 固定案例" },
                    ]}
                    style={{ width: 260, maxWidth: "100%" }}
                  />
                  <p className="muted">
                    预设方案用于稳定回放，不开放自由修改预算、目标或人数。
                  </p>
                  <Button
                    type="primary"
                    disabled={state.published}
                    onClick={() => {
                      dispatch({ type: "submit" });
                      go("review");
                    }}
                  >
                    提交复核
                  </Button>
                  {state.published && (
                    <Button onClick={() => go("review")}>查看已发布配置</Button>
                  )}
                </Card>
              ),
            },
          ]}
        />
      </>
    );
  else if (section === "review")
    content = (
      <>
        <Alert
          type="info"
          showIcon
          message="审核什么，就执行什么。"
          description="提交时冻结关键配置，发布时再次核对；正式经营名单在发布时生成。"
        />
        {state.reviewStatus === "未提交" &&
          requireAction("请先提交经营方案。", "campaign")}
        <Card title="提交复核摘要">
          <Tag color={state.published ? "green" : "gold"}>
            {state.reviewStatus} / {state.campaignStatus}
          </Tag>
          <Summary />
          {notices}
          <Space wrap className="actions">
            {state.reviewStatus === "待复核" && (
              <>
                <Button
                  type="primary"
                  onClick={() => {
                    dispatch({ type: "approve" });
                    dispatch({ type: "publish" });
                  }}
                >
                  通过复核并发布
                </Button>
                <Button onClick={() => dispatch({ type: "approve" })}>
                  仅通过复核，检查配置变更
                </Button>
              </>
            )}
            {state.reviewStatus === "已通过" && !state.published && (
              <>
                <Button
                  type="primary"
                  onClick={() => dispatch({ type: "publish" })}
                >
                  发布已审核方案
                </Button>
                <Button onClick={() => dispatch({ type: "change" })}>
                  模拟复核后关键配置变化
                </Button>
              </>
            )}
            {state.reviewStatus === "需重新复核" && (
              <Button
                type="primary"
                onClick={() => dispatch({ type: "restore" })}
              >
                恢复固定方案并重新提交复核
              </Button>
            )}
            {state.published && (
              <Button type="primary" onClick={() => go("wallet")}>
                进入客户领取
              </Button>
            )}
          </Space>
        </Card>
        <Collapse
          items={[
            {
              key: "why",
              label: "为什么需要重新复核？",
              children: (
                <p>
                  已审核后的客群规则、预算或关键配置发生变化，原审核失效，需要重新复核。发布后的版本不可编辑；这个预设反例不会改动固定案例数字。
                </p>
              ),
            },
            {
              key: "cap",
              label: "活动预算如何控制？",
              children: (
                <p>
                  同一活动所有投放批次的累计分配不能超过活动总预算或更低的硬上限，不能靠增加批次绕过
                  ¥6000 上限。
                </p>
              ),
            },
          ]}
        />
      </>
    );
  else if (section === "wallet")
    content = (
      <div className="wallet">
        <div className="customer-nav">
          <strong>生活权益</strong>
          <span>我的权益</span>
        </div>
        <h2>我的权益</h2>
        <p>合成客户：{f.customers[0].id}</p>
        {!state.published &&
          requireAction("活动尚未发布，请先完成复核。", "review")}
        <Card className="coupon" title={f.benefit.name}>
          <Tag color={state.claimStatus === "已领取" ? "green" : "gold"}>
            {state.redemptionStatus === "已核销" ? "已核销" : state.claimStatus}
          </Tag>
          <h2>
            {money(f.benefit.face)} <small>生活权益</small>
          </h2>
          <p>适用场景：社区生活</p>
          <p>适用商户：{f.merchants[0].name}</p>
          <p>消费满 {money(f.benefit.minSpend)} 可用</p>
          <p>领取后 7 天有效；回放有效期至 {f.replay.expiresAt}</p>
          <Button
            type="primary"
            disabled={!state.published || state.claimStatus === "已领取"}
            onClick={() => dispatch({ type: "claim" })}
          >
            {state.claimStatus === "已领取" ? "已领取" : "领取权益"}
          </Button>
        </Card>
        {notices}
        <p className="muted">
          预算变化说明：Reserve = 已经承诺给客户、但还没有实际核销的预算。
        </p>
        {state.claimStatus === "已领取" && (
          <Button onClick={() => go("redemption")}>
            切换商户视角，完成核销
          </Button>
        )}
      </div>
    );
  else if (section === "redemption")
    content = (
      <>
        <Alert message="预设模拟消费与核销，不产生真实支付。" />
        {state.claimStatus !== "已领取" &&
          requireAction("请先领取权益。", "wallet")}
        <Card title="核销生活权益">
          <Descriptions
            bordered
            column={1}
            items={[
              ["当前模拟商户", f.merchants[0].name],
              ["权益", f.benefit.name],
              ["状态", state.redemptionStatus],
              ["最低消费", money(f.benefit.minSpend)],
              ["预设消费金额", money(f.benefit.minSpend)],
              ["有效期至", f.replay.expiresAt],
            ].map(([label, children]) => ({ key: label, label, children }))}
          />
          <Space className="actions" wrap>
            <Tooltip title="幂等：重复操作不产生第二次成本">
              <Button
                type="primary"
                disabled={state.claimStatus !== "已领取"}
                onClick={() => dispatch({ type: "redeem" })}
              >
                确认核销
              </Button>
            </Tooltip>
            {state.redemptionStatus === "已核销" && (
              <Button
                onClick={() => {
                  dispatch({ type: "end" });
                  go("fulfillment");
                }}
              >
                停止投放，查看后续履约
              </Button>
            )}
          </Space>
          {notices}
          <p>
            单笔回放：银行预算 {money(f.benefit.bankCost)}{" "}
            从预占转为实际成本。目标行为需要独立观察，核销不会自动推定客户活跃。
          </p>
        </Card>
      </>
    );
  else if (section === "fulfillment")
    content = (
      <>
        <Alert
          showIcon
          type={settled ? "success" : "warning"}
          message={
            settled ? "权益履约已完成" : "“活动结束” ≠ “所有成本已经结清”"
          }
          description={
            settled
              ? "全部已领取权益已核销或到期。"
              : "停止继续发放后，此前已领取的权益仍可继续核销或到期。"
          }
        />
        {state.redemptionStatus !== "已核销" ? (
          requireAction("请先走完单笔核销回放。", "redemption")
        ) : (
          <Card title="投放与履约状态">
            <Space>
              <Tag>停止投放</Tag>
              <Tag color={settled ? "green" : "gold"}>
                {settled ? "履约完成 · SETTLED" : "履约进行中 · ONGOING"}
              </Tag>
            </Space>
            <p>
              投放窗口：{f.campaign.start} 至 {f.campaign.end}
            </p>
            <p>
              目标观察窗口：同投放窗口，期外行为不计入目标；权益履约窗口：每笔领取后
              7 天。
            </p>
            <div className="two-cards">
              <Card title="已核销">形成实际成本，不再重复扣减。</Card>
              <Card title="未使用到期">释放预占预算，归还可用额度。</Card>
            </div>
            <p>
              下一步回放其余客户的固定结果：275 人核销、225
              份权益未使用到期。不等待真实时间，也不新增交易。
            </p>
            <Button
              type="primary"
              disabled={settled}
              onClick={() => {
                dispatch({ type: "end" });
                dispatch({ type: "settle" });
              }}
            >
              推进到履约完成
            </Button>
            {notices}
            {settled && (
              <Button onClick={() => go("final-review")}>
                查看最终经营复盘
              </Button>
            )}
          </Card>
        )}
      </>
    );
  else if (section === "final-review")
    content = (
      <>
        {!settled && (
          <Alert
            showIcon
            message="正在查看固定完整案例；当前操作回放尚未结束。"
            description="以下是既有案例的最终结果，不是你刚才单次点击累计出的数据。完成履约回放后可记录决策。"
            action={<Button onClick={() => go("fulfillment")}>继续回放</Button>}
          />
        )}
        <Alert
          showIcon
          type="success"
          message="固定案例：已领取权益履约已完成"
        />
        <Card title="经营目标达成">
          <div className="metrics">
            <Statistic title="观察结果 / 预设目标" value="224 / 150" />
            <Statistic title="目标完成率" value="149.3%" />
            <Statistic title="与目标差额" value="+74" />
            <Statistic title="达标状态" value="已达标" />
          </div>
          <p>{f.targetExplanation}</p>
          <p className="muted">
            目标行为仅计入投放批次观察窗口；核销、预算和成本为累计履约。
          </p>
        </Card>
        <Card title="客户行为漏斗 · 按客户去重">
          <Funnel />
        </Card>
        <Card title="预算与成本">
          <BudgetCards data={f.review.budget} />
          <p>
            商户承担：{money(f.review.merchant_contribution)}
            。累计释放是历史流水合计，不与当前预占重复加总。
          </p>
        </Card>
        <Card title="经营拆解">
          <Tabs
            items={Object.entries({
              segment: "客群快照",
              scene: "场景",
              merchant: "商户",
              benefit: "权益",
            }).map(([key, label]) => ({
              key,
              label,
              children: (
                <Table
                  rowKey="name"
                  pagination={false}
                  scroll={{ x: 680 }}
                  dataSource={f.review.breakdown[
                    key as keyof typeof f.review.breakdown
                  ].map((row) => ({
                    ...row,
                    dimension_id: String(row.dimension_id),
                  }))}
                  columns={[
                    { title: label, dataIndex: "name" },
                    { title: "领取客户", dataIndex: "claimed" },
                    { title: "核销客户", dataIndex: "redeemed" },
                    { title: "目标行为", dataIndex: "target_actions" },
                    {
                      title: "银行成本",
                      dataIndex: "bank_cost",
                      render: money,
                    },
                    { title: "规则建议", dataIndex: "suggestion" },
                  ]}
                />
              ),
            }))}
          />
        </Card>
        <Card title="下一轮资源决策 · 人工记录">
          <p>
            规则提示提供判断依据，最终选择由经营人员记录；固定原案例未预设决策。
          </p>
          <Space wrap>
            <Select
              aria-label="下一轮资源决策"
              placeholder="选择下一轮决策"
              value={choice || state.decision || undefined}
              onChange={setChoice}
              options={f.decisions.map((value) => ({ value, label: value }))}
              style={{ width: 180 }}
            />
            <Button
              type="primary"
              disabled={!settled || !choice}
              onClick={() => dispatch({ type: "decision", value: choice })}
            >
              保存决策与指标快照
            </Button>
          </Space>
          {state.decision && (
            <p>
              已记录：{state.decision} · 224 / 150 · 实际成本 ¥3300 ·
              仅当前浏览器
            </p>
          )}
          {notices}
        </Card>
      </>
    );
  else if (section === "merchants")
    content = (
      <>
        <Tabs
          items={[
            {
              key: "merchants",
              label: "场景与商户",
              children: (
                <>
                  <Space wrap>
                    <Input
                      aria-label="搜索商户"
                      placeholder="搜索合成商户"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select
                      aria-label="按场景筛选"
                      value={scene}
                      onChange={setScene}
                      options={["全部", ...f.scenes].map((value) => ({
                        value,
                        label: value,
                      }))}
                      style={{ minWidth: 210 }}
                    />
                  </Space>
                  <Table
                    rowKey="name"
                    dataSource={f.merchants.filter(
                      (m) =>
                        m.name.includes(search) &&
                        (scene === "全部" || m.scene === scene),
                    )}
                    pagination={{ pageSize: 12, hideOnSinglePage: true }}
                    scroll={{ x: 550 }}
                    columns={[
                      { title: "商户", dataIndex: "name" },
                      { title: "地区", dataIndex: "district" },
                      { title: "场景", dataIndex: "scene" },
                      { title: "数据标记", render: () => "合成生活商户" },
                    ]}
                  />
                </>
              ),
            },
            {
              key: "benefits",
              label: "权益模板",
              children: (
                <Card title={f.benefit.name}>
                  <Summary />
                  <p>
                    面值 ¥20；满 ¥40 可用；领取后 7 天有效；无需积分；总库存
                    10000。
                  </p>
                </Card>
              ),
            },
          ]}
        />
      </>
    );
  else if (section === "budget")
    content = (
      <>
        <p>
          当前阶段：
          {settled
            ? "完整案例履约完成"
            : "单客户操作回放（不包含其余客户的历史汇总）"}
        </p>
        <BudgetCards data={stageBudget} />
        <Card title="预算流水 · 演示规则示意">
          <p>这里展示三类规则，不伪装成逐笔历史交易。金额单位：元。</p>
          <Table
            rowKey="type"
            pagination={false}
            scroll={{ x: 550 }}
            dataSource={[
              {
                type: "预占 · RESERVE",
                when: "领取成功",
                reserve: "+12",
                cost: "0",
                explain: "承诺给客户，尚未花掉",
              },
              {
                type: "实扣 · COMMIT",
                when: "实际核销",
                reserve: "−12",
                cost: "+12",
                explain: "同一份权益转为实际成本",
              },
              {
                type: "释放 · RELEASE",
                when: "另一份未使用权益到期 / 取消",
                reserve: "−12",
                cost: "0",
                explain: "释放该权益预占，不与实扣同时发生",
              },
            ]}
            columns={[
              { title: "业务动作", dataIndex: "type" },
              { title: "触发条件", dataIndex: "when" },
              { title: "预占变化", dataIndex: "reserve" },
              { title: "成本变化", dataIndex: "cost" },
              { title: "含义", dataIndex: "explain" },
            ]}
          />
          <p>剩余可用 = 总预算 − 当前预占 − 实际成本。累计释放不重复扣除。</p>
        </Card>
      </>
    );
  else
    content = (
      <Card>
        <p>请选择一个演示页面。</p>
        <Button onClick={() => go("overview")}>返回经营总览</Button>
      </Card>
    );
  return (
    <div className="demo-layout">
      <aside className="sidebar">{menu}</aside>
      <Drawer
        title="演示导航"
        placement="left"
        open={drawer}
        onClose={() => setDrawer(false)}
      >
        {menu}
      </Drawer>
      <div className="demo-main">
        <header className="demo-header">
          <Button
            className="mobile-menu"
            aria-label="打开导航菜单"
            icon={<MenuOutlined />}
            onClick={() => setDrawer(true)}
          />
          <Tooltip title={boundary}>
            <Tag>固定合成数据演示</Tag>
          </Tooltip>
          <Select
            aria-label="切换业务视角"
            value={state.viewMode}
            onChange={(v) =>
              go(
                v === "客户视角"
                  ? "wallet"
                  : v === "商户视角"
                    ? "redemption"
                    : "overview",
              )
            }
            options={["经营端", "客户视角", "商户视角"].map((value) => ({
              value,
              label: value,
            }))}
            style={{ width: 125 }}
          />
        </header>
        <div className="guide">
          <div className="guide-steps">
            <Steps
              size="small"
              current={index}
              onChange={(i) => go(steps[i][0])}
              items={steps.map(([, title]) => ({ title }))}
            />
          </div>
          <Space wrap>
            <Button
              disabled={index <= 0}
              onClick={() => go(steps[index - 1][0])}
            >
              上一步
            </Button>
            <Button
              disabled={index < 0 || index === 6}
              onClick={() => go(steps[index + 1][0])}
            >
              下一步
            </Button>
            <Button icon={<ReloadOutlined />} onClick={reset}>
              重新开始
            </Button>
          </Space>
        </div>
        <main
          className={
            "demo-content " + (section === "wallet" ? "consumer-mode" : "")
          }
        >
          <h1>{titles[section] || "演示"}</h1>
          {content}
        </main>
        <footer>渝惠｜零售客户经营与场景权益平台 · 固定合成数据静态回放</footer>
      </div>
    </div>
  );
}
