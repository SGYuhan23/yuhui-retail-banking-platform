# V3 数据模型

增量迁移：infra/init/06-v3-operating.sql，全部位于既有 marketing 库。原表不改名、不删列、不搬迁。金额 BIGINT，单位分。

| 新表 | 作用 / 关键约束 |
|---|---|
| v3_customer | 30,000 固定种子客户、mock_flag、经营标签、合成积分、营销许可及 source_version |
| v3_segment | 可编辑规则和名称，白名单 AND/OR 谓词 |
| v3_segment_snapshot | 客群、人数、规则、来源版本及创建时间 |
| v3_segment_snapshot_member | snapshot_id + customer_id 联合主键，完整冻结属性 JSON |
| v3_scene | 4 种场景 |
| v3_merchant | 虚构名称、地区、场景、类别、状态、mock_flag |
| v3_benefit | 券 / 积分兑换 / 抽奖类型、面值/门槛/银行成本/商户让利/积分价格/期限/库存 |
| v3_campaign | 名称、状态、草稿经营配置 JSON、创建/更新时间 |
| v3_campaign_version | 活动 + 快照外键，完整冻结配置 JSON，只读 |
| v3_campaign_run | 活动、版本、快照外键，状态、执行窗口及分配预算 |
| v3_campaign_budget | 每批次总额和并发行锁锚点；无可漂移的 usedBudget 缓存 |
| v3_entitlement | 唯一码、批次/客户/权益唯一约束、绑定商户、条款快照、成本、积分、状态/有效期 |
| v3_budget_ledger | RESERVE/COMMIT/RELEASE、预占/实扣增量、金额、业务引用、幂等键 |
| v3_event_ledger | 批次/客户/快照/事件/商户/场景/权益/成本/业务引用/幂等键/发生时间/元数据 |
| v3_decision_record | 批次、人工决策、原因、指标快照及记录时间 |

## 一致性
V3Store.tx 使用单 MySQL 连接、READ_COMMITTED 和显式 commit/rollback。领取/核销/释放先锁 v3_campaign_budget 批次行，再处理客户、库存或权益，避免两个并发请求同时使用同一额度。预算由流水 SUM 计算，读取复盘时也锁同一行以获得一致账本视图。唯一索引防止同一领取、核销和事件重复入账。

快照/成员、活动版本、预算流水、事件流水和决策记录的 UPDATE/DELETE 由数据库触发器拒绝；已发布快照也拒绝新增成员。没有这些对象的编辑 API。显式 Reset 使用当前事务会话标志，仅重置 v3_ 表。数据库超级用户仍有 DDL 能力，这不是生产审计存储或防 DBA 篡改方案。

## 预算等式
reserved = SUM(reserved_delta)
committed = SUM(committed_delta)
released = SUM(bank_amount WHERE operation_type='RELEASE')
available = total - reserved - committed
utilization = committed / total
budget_burn_rate = (reserved + committed) / total

预占释放后可用于其他客户；released 是累计量，不能再从 available 重复扣减。total 是版本分配额度，其他可变金额均来自 Budget Ledger。

## 重置的可复现边界
客户属性、客户编号、客群人数、事件类型/数量、成本、模拟业务发生时间固定。AUTO_INCREMENT 主键和管理操作 created_at 随重置次数/实际时间变化；不承诺 ZIP/数据库逐字节一致。这样避免浏览器旧批次链接被复用为另一个批次。

## FINAL PATCH 增量

`infra/migration/07-v3-final-patch.sql` 可重复运行。v3_campaign 新增 nullable：review_config_json JSON、review_config_hash CHAR(64)、review_submitted_at DATETIME、review_approved_at DATETIME。旧待复核/已批准且无 hash 的记录退回 DRAFT，不改历史已发布版本/台账。06 保持原历史脚本，start.sh 顺序应用 06、07。

提交快照采用执行字段白名单，递归排序 JSON 对象键、规范数值并排除 created_at/updated_at/issued_stock；整数保持整数序列化。SHA-256 存入 review_config_hash。批准保留提交内容；发布重算 hash，在 campaign 和 segment 等配置行锁内比较、冻结成员。发布版本配置增加 segment_rule_json、review_config_hash。

Run 分配先锁 campaign 父行，再 SUM 所有 Run 的 budget_total；existing+requested≤min(total,hard)，hard 可空。当前无 Run 取消/额度回收，全部历史 Run 均有效。原 Claim/Reserve/Commit/Release 及不可变触发器不变。

Review 新字段：target_metric/value/actual/delta/achievement_rate/met、review_as_of、run_start_at/end_at、target_observation_start_at/end_at、fulfillment_status、outstanding_entitlement_count。均实时计算，无新指标表；Decision metrics_snapshot_json 冻结包含这些字段。目标窗口筛选也应用于漏斗、四维目标拆解与单位目标成本分母；预算与核销不截断。
