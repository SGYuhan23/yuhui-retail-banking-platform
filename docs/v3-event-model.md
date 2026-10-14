# V3 事件与接口

## 事件语义
| 类型 | 产生位置 | 前置条件 |
|---|---|---|
| ELIGIBLE | 创建 Run，依据冻结成员写入 | 发布版本存在 |
| DELIVERED | 操作员模拟有效触达 / 消费者模拟领取流程 | 快照成员、当前许可、执行窗口、运行中 |
| PARTICIPATED | 操作员模拟参与 / 消费者领取流程 | 已触达 |
| CLAIMED | 权益领取事务 | 已参与、库存、积分、预算、商户均有效 |
| REDEEMED | 商户核销事务 | 权益有效且未使用，商户及消费门槛通过 |
| TARGET_ACTION_COMPLETED | 独立模拟观察操作 | 已核销、目标类型匹配、仍在观察窗口 |
| POINTS_SPENT | 积分权益领取事务 | 成功扣减合成积分 |
| POINTS_REFUNDED | 合成积分权益取消事务 | 取消成功，原权益有积分扣减 |

事件键 = run_id:event_type:customer_id。P0 每批次一个权益、每人一次，因此按阶段去重。业务引用为 entitlement code 或显式 mock 引用；metadata 标明 mock_data、action、causal_claim=false（目标观察）。REDEEMED 记录已冻结的银行成本和商户让利；其他事件不重复累计履约成本。

预算流水键 = operation:entitlement_code。RESERVE(+cost,0)，COMMIT(-cost,+cost)，RELEASE(-cost,0)。事务失败时权益、库存、积分、预算和事件一起回滚。

## API 清单
前缀 `/api/v1/v3`，只在 local profile 注册，沿用回环访问拦截。成功 `{code:1000,data:...,message:'成功'}`；业务校验失败 code=4000。金额参数为整数分，时间为上海本地时间。

| 方法 / 路径 | 用途 |
|---|---|
| GET /customers?page=&search= | 分页客户列表，每页 50 |
| GET /segments | 客群规则 |
| POST /segments/preview | 接收 logic + conditions，计算人数/分布 |
| POST /segments；PUT /segments/{id} | 创建 / 编辑规则 |
| POST /segments/{id}/snapshots | 手工冻结快照 |
| GET /snapshots；GET /snapshots/{id}/members?page= | 快照及成员 |
| GET /catalog | 场景、商户、权益模板 |
| POST /merchants；POST /benefits | 新增合成商户、权益 |
| GET /campaigns；POST /campaigns；PUT /campaigns/{id} | 活动草稿列表/创建/编辑 |
| POST /campaigns/{id}/submit、approve、reject、publish | 轻量治理状态转换 |
| GET /versions；POST /versions/{id}/runs | 查看冻结版本 / 创建批次 |
| GET /runs；POST /runs/{id}/end | 查看 / 结束批次 |
| POST /runs/{id}/events | 仅允许 DELIVERED/PARTICIPATED/TARGET_ACTION_COMPLETED |
| POST /runs/{id}/claim | customer_id、merchant_id，事务领取 |
| GET /wallet?customerId=；GET /offers?customerId= | 消费者权益 / 可参与活动，移除经营成本 |
| GET /entitlements/{code} | 查询核销码及冻结条款 |
| POST /redeem | code、merchant_id、mock_spend，模拟核销 |
| POST /cancel | code、customer_id，取消并释放 |
| POST /expire | 到期释放；定时任务每 60 秒调用同一逻辑 |
| GET /runs/{id}/review | 账本重算复盘 |
| GET /runs/{id}/ledger?type=event或budget&eventType=&page= | 事实明细，每页 100 |
| POST /runs/{id}/decisions | decision_type、reason，冻结指标 |
| GET /overview | 活动预算、预警、复核/复盘待办 |
| POST /demo/reset | seed、confirmation=RESET_V3_DEMO |

规则样例：`{"logic":"AND","conditions":[{"field":"last_active_days","op":">=","value":60},{"field":"marketing_consent","op":"=","value":true}]}`。字段/运算符均白名单；值使用 PreparedStatement 参数绑定。
