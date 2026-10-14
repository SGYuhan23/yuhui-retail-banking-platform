# V3 FINAL PATCH 冻结报告

2026-10-14。**V3_FINAL_FREEZE_READY = YES**（本地合成演示）。**STOP DEVELOPMENT**。

仅修复三个冻结问题，无新增范围外功能、Agent、公网部署、业务模块或架构重构。先完成 v3-final-patch-audit.md 后实施。

## PATCH-1：Campaign 分配硬上限

原问题：单次分配按 hard cap，但累计只检查 total，硬上限实际成为 per-run cap。

修复：创建 Run 在 Store 单事务中 SELECT campaign FOR UPDATE，SUM 该活动所有已有 Run 的 budget_total，再检查 requested <= min(total, hard)-allocated。hard 为 null 时采用 total。现有模型无 Run 取消/额度回收，因此 ENDED 等全部已分配 Run 仍有效。可选请求 allocated_budget（整数分），省略仍申请整个上限，P0 UI 保持默认单批次。超额返回 CAMPAIGN_BUDGET_CAP_EXCEEDED 和已分配/本次申请/上限金额。未改 Claim/Reserve/Commit/Release。

测试：6000/2400 下 2400 后 +1 拒绝；6000/null 下 3000+3000 后 +1 拒绝；6000/5000 下 2400+2600 后 +1 拒绝；两个并发 2400 仅一个成功。原 20 并发领取、16 并发核销、释放幂等继续通过。

## PATCH-2：Review Integrity

原问题：submit/approve 只改状态，publish 重新读取最新 Segment，审核与发布可能不一致。

修复：提交时生成执行字段白名单 JSON，包含规则、目标、场景、权益条款/成本、商户范围、预算、停止规则、时间。递归排序对象键、规范数字、排除时间戳和 issued_stock 等波动字段，以 UTF-8 SHA-256 指纹保存。批准只标记已提交快照，不刷新配置。发布锁 campaign/segment 等配置行并重算；不匹配返回 REVIEW_CONTENT_CHANGED 且持久化退回 DRAFT。使用事务内业务结果、事务提交后 Controller 映射错误，避免抛异常导致状态回滚。成功时使用批准快照写版本，另附发布 snapshot_id/hash。

页面可查看提交配置、hash、提交/批准时间。手工快照仅留存；发布按复核一致规则冻结当时客户成员，Run 使用发布快照。提交不冻结成员。原不可变版本/快照/账本触发器保留。

测试：未变化发布、预算直接 SQL 测试变更拒绝、Segment 在提交后/批准后单独变更拒绝、退回草稿状态持久化、重新提交/批准可发布、版本内容逐字段等于批准快照、不可变触发器、canonical 键序/整数往返/UI 排除均通过。

## PATCH-3：目标与时间口径

目标值来自冻结版本；actual 从 Event Ledger 按客户去重，限定 Run start_time≤occurred_at≤end_time。目标差额、完成率、达标状态真实计算，漏斗/四维拆解/单位目标成本分母同步使用窗口。

review_as_of 采用 Asia/Shanghai。核销、预算、实扣、释放为该一致账本视图截至当前累计履约事实，包含投放结束后核销。未终态权益计 outstanding，AVAILABLE 即使待到期任务仍为 ONGOING；全部终态为 SETTLED。结束批次只停止新增投放/领取，不提前作废权益。页面显示 as-of、窗口、待履约提示和合成事实边界，允许已结束但履约进行中的阶段决策。Decision 仍保存当时完整指标快照。

测试：150→224，差额74，完成率1.493333；额外插入10条窗口外事件，总事件234但 actual仍224；ENDED+待履约为ONGOING；真实跨过配置结束时间后的核销使 committed/cost 增加但 target不变；到期释放一次后SETTLED；历史Decision不漂移。浏览器另验证手工结束后核销与阶段决策。

## 数据库变更

新增幂等增量 infra/migration/07-v3-final-patch.sql，v3_campaign 增加 nullable 的 review_config_json JSON、review_config_hash CHAR(64)、review_submitted_at DATETIME、review_approved_at DATETIME。已连续执行两次成功。旧待复核/批准但无快照记录退回草稿。06 历史脚本和已发布历史不改；start.sh 自动按06→07应用。无新增表，无旧业务表变更。

## 实际验证

| 项目 | 结果 | 随包原始证据（verification/final-patch） |
|---|---|---|
| 后端构建 | PASS / BUILD SUCCESS | backend-build.log |
| 后端测试 | PASS / 10 tests, 0 failures/errors/skipped | backend-tests.log |
| Final Patch 定向 | PASS / 22 条断言 | targeted-tests.log、targeted-acceptance.json |
| 完整 check-v3.py | PASS / 48 条断言 | v3-check.log、v3-acceptance.json |
| 旧业务回归 | PASS / 10 组脚本均退出0 | old-regression.log、old-regression.json |
| Frontend Type Check | PASS | frontend-typecheck.log |
| Frontend Build | PASS | frontend-build.log |
| 最终 Reset 两次复现 | PASS | final-reset.log |
| 浏览器主流程 | PASS | browser-flow.json、review-config.jpg、ongoing-review.jpg、post-end-redeem.jpg、settled-review.jpg、wallet.jpg |
| 固定案例目标展示 | PASS | final-review.jpg、final-review-dom.txt |

旧课程 app 测试依赖非 local 环境，原配置仍跳过，不计为通过。原业务由10组真实集成脚本覆盖。前端构建的 Browserslist 数据过期提示保留，不影响成功结果。

验收中遇到两次已解决失败：启动未就绪导致连接拒绝（startup-retry 日志）；canonical 数字科学计数法被读成小数导致 Reset 拒绝，修为整数序列化并新增往返单测，随后全部重跑通过。失败原始记录保留以区分修复前后。浏览器只操作合成数据，最终两次 Reset 清除测试夹具恢复标准案例。

## 固定数据核对

Snapshot 2166，Delivered 1563，Participated 964，Claimed 500，Redeemed 275，Target 224；Committed 3300元，Released 2700元，Merchant Contribution 2200元。Seed 202610 未改。客户内容哈希、事件数、预算流水复现相同；自增ID和实际管理时间不承诺相同。当前合成案例目标完成率149.3%，不代表真实银行成效或因果增量。

## AC1–AC25

| AC | 要求 | 结果 |
|---|---|---|
| AC1 | 创建查看合成客群 | PASS |
| AC2 | 客群人数预览 | PASS |
| AC3 | 不可变客群快照 | PASS |
| AC4 | 经营目标/客群/场景/权益/预算/KPI/停止规则配置 | PASS |
| AC5 | 不可变发布版本 | PASS |
| AC6 | 创建投放批次 | PASS |
| AC7 | 领取产生权益、事件、预占 | PASS |
| AC8 | 核销产生事件并预占转实扣 | PASS |
| AC9 | 失效释放预算 | PASS |
| AC10 | 并发预算不超发 | PASS |
| AC11 | 重复核销仅成功一次 | PASS |
| AC12 | 复盘事实可从台账重算 | PASS |
| AC13 | 客群/场景/商户/权益四维拆解 | PASS |
| AC14 | 人工决策及指标快照 | PASS |
| AC15 | 固定种子可复现 | PASS |
| AC16 | 原积分/抽奖/权益不回归 | PASS |
| AC17 | Synthetic 页面边界 | PASS |
| AC18 | README 技术声明准确 | PASS |
| AC19 | 活动累计分配硬上限 | PASS |
| AC20 | 批准后配置或规则变更拒绝发布 | PASS |
| AC21 | 发布内容等于批准快照 | PASS |
| AC22 | 目标值取发布版本/实际取事件 | PASS |
| AC23 | 目标仅统计冻结观察窗口 | PASS |
| AC24 | 投放结束与履约结束分离 | PASS |
| AC25 | 结束后履约累计变化且不推定目标行为 | PASS |

AC12 的经营指标来自事件/预算流水；冻结人数取 Snapshot，目标值取发布版本，待履约数取 Entitlement，均为实际数据库事实，无前端硬编码结果。完整证据映射见 final-patch-acceptance.json。

## 修改文件清单

- `yuhui-server/entrypoints/src/main/java/com/yuhui/operating/V3Campaigns.java`
- `yuhui-server/entrypoints/src/main/java/com/yuhui/operating/V3Controller.java`
- `yuhui-server/entrypoints/src/main/java/com/yuhui/operating/V3Review.java`
- `yuhui-server/entrypoints/src/main/java/com/yuhui/operating/V3ReviewConfig.java`
- `yuhui-server/entrypoints/src/test/java/com/yuhui/operating/V3ReviewConfigTest.java`
- `yuhui-web/src/pages/Operating/Campaigns.tsx`
- `yuhui-web/src/pages/Operating/Review.tsx`
- `infra/migration/07-v3-final-patch.sql`
- `scripts/start.sh`
- `scripts/check-v3.py`
- `scripts/check-v3-final-patch.py`
- `scripts/v3_test_support.py`
- `scripts/v3_final_patch_checks.py`
- `README.md`
- `docs/v3-product-spec.md`
- `docs/v3-data-model.md`
- `docs/v3-demo-script.md`
- `docs/v3-truth-boundaries.md`
- `docs/v3-final-patch-audit.md`
- `docs/v3-final-patch-report.md`

另更新构建产物 dist、验收 JSON 和 verification/final-patch 原始证据。V3Execution.java、V3Demo.java、V3Store.java、06 初始化及旧业务代码未改。

## 保留 P2 / 限制

NEW=last_active_days<7；历史商户展示名未完全冻结；无样本拆解 null/0 展示；现有 DDD 层次；消费者首页抽奖内容较多；不提供复杂多Run管理。维持固定本地演示身份、无真实银行业务/支付/清结算，生产运行能力未验证。这些属于当前实现边界。

Blocking Issues：无。

**V3_FINAL_FREEZE_READY = YES**

**STOP DEVELOPMENT**
