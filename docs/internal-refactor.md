# 保持表现与功能的内部重构（2026-10-17）

基线提交：`349f3d5`。本次交付范围是接口服务层、运营配置请求复用和规则树布局计算，不代表全仓独立重写。参考来源与许可核查继续保留在 [参考审计](reference-overlap-audit.md)，没有删除来源、改写历史或作出无法识别来源的保证。

## 实际实现

| 文件 / 模块 | 本次工作 |
|---|---|
| `yuhui-web/src/services/api.ts` | 保留原来 105 个导出入口的兼容门面，调用方无需迁移 |
| `services/transport/client.ts` | 统一请求执行、响应解包与长 ID 解码；区分普通 JSON、带字符集 JSON、multipart |
| `services/resources/configuration.ts` | 以资源和命令描述生成 11 类运营配置的查询、新增、修改和删除调用，集中维护 POST 删除等既有协议 |
| `services/resources/identity.ts` | 认证与权限资源服务；沿用既有接口和认证系统，不宣称新实现认证 |
| `services/resources/profile.ts` | 个人资料、文件上传和 OAuth 绑定服务，保持原有参数编码 |
| `services/resources/rewards.ts` | 积分、签到、赠送和抽奖服务，保持请求体及响应类型 |
| `services/resources/operations.ts` | 组合运营资源和流水查询，保留全部调用签名 |
| `pages/RuleTreeEditor/graph-model.ts` | 纯函数布局模型，使用邻接索引和分阶段计算完成列分配、节点位置、跨层连线避让及标签排布 |
| `pages/RuleTreeEditor/index.tsx` | 通过 memo 调用布局模型；原有 JSX、表单、拖动、保存、删除交互保持逐字一致 |
| `scripts/check-service-contract.cjs` | 基于修改前执行结果的契约测试，覆盖所有导出和失败传递 |
| `scripts/check-editor-layout.cjs` | 比较 120 组固定图数据的完整布局输出及输入不可变性 |
| `scripts/check-ui-invariants.py` | 对 632 个已有文件及编辑器交互/渲染片段做 SHA-256 完整性检查 |

上述 services 和 pages 路径均位于 `yuhui-web/src/`。资源接口参数、类型定义及必须兼容的布局规则继续沿用现有契约；不是将这些内容声称为从零原创。

## 不变范围

页面、文案、CSS、图片、路由、后端业务源码、数据库初始化/迁移、锁文件、Final 素材保持不变。没有改变抽奖概率、库存规则、积分、权益核销、事务或幂等实现。未部署、未推送远端，也未实现纯静态模拟后端。

规则树测试覆盖空图、断开节点、缺失连线端点、重复规则名、跨层边、保存坐标与重叠标签。保留原有 DAG 布局语义；原实现对可达环可能无法终止的问题未在本轮改变，不能把本次测试称作循环图支持。

## 实际验证

| 检查 | 结果 |
|---|---|
| 服务契约 | 105 个导出，630 组调用；6 类响应、长 ID、multipart、编码、默认参数及全部 HTTP 入口异常传递通过 |
| 规则树布局 | 120 组图完整坐标、顺序、画布尺寸一致，未修改输入 |
| 源码/数据完整性 | 632 个文件及编辑器交互/JSX 片段一致 |
| TypeScript / production build | 通过；仅原有 Browserslist 数据过旧提示 |
| 实际读取接口 | 21 / 21 通过 |
| 实际运营 CRUD | 11 类资源新增、修改、查询、删除全部通过，临时配置已清理 |
| 抽奖流程 | 20 项通过，使用独立测试用户 |
| 钱包 | 5 项通过，含并发核销及归属校验 |
| 浏览器 | 首页、钱包、运营活动页/修改表单和规则树可用 |
| 截图 | 同环境重新构建的首页对照、规则树对照均为零像素差异；首页 DOM 文字与几何一致 |

首次旧标签页首页截图有差异，未直接将其判为通过。随后以修改前源文件、相同依赖及构建参数重建对照版本，再在同一浏览器比较，得到零像素差异；没有通过修改样式适配截图。具体记录见 [视觉检查](../verification/internal-refactor/visual-comparison.json)。这是已检查页面/状态的证据，不是穷举所有浏览器状态。

后端源码未改变，本轮没有冒用历史后端单元测试结果。运行流程测试会产生独立演示用户及其流水，原有演示配置未改写。

## 可重复执行

安装前端锁定依赖并完成 `postinstall` 后，在仓库根执行：

```sh
npm --prefix yuhui-web run test:contracts
python3 scripts/check-ui-invariants.py
npm --prefix yuhui-web run tsc
REPLICA_LOCAL=true npm --prefix yuhui-web run build
python3 scripts/portfolio_verify.py
```

需要本地完整服务的检查：`scripts/smoke.py`、`scripts/check-crud.py`、`scripts/check-flow.py`、`scripts/check-wallet.py`。契约基线已随仓库保存，正常运行测试不依赖本地备份或原始 ZIP；`--record` 仅用于开发时从修改前备份生成基线，不能拿新实现覆盖预期结果。

## 验证工具修正

旧读取检查用正则从单一 `api.ts` 找 URL，拆分后可能零用例通过，现使用明确的 21 项清单并检查数量。Public verifier 将相对路径 `pages/Auth/Users/...` 误识别为个人绝对路径，现补充路径边界；真实绝对路径检测仍有效。参考审计 JSON 中的原 ZIP/目录名作为来源证据保留，仅对此文件豁免旧运行身份名称检查，其余密钥、链接及路径扫描仍执行。
