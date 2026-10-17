# 参考代码重合复核（2026-10-17）

## 结论

未完成“全仓独立实现”验收。此前工程整理摘要只说明部分结构调整，不能作为低相似度或公开许可的证明。任何相似度阈值都不能证明公开分发权限。

本轮仅新增可重复执行的审计工具与证据，未以改名、删注释、格式调整掩盖来源，未更改业务代码、Git 历史或远端可见性。

## 来源

用户提供的后端来源：[userwanyong/lottery-backend](https://github.com/userwanyong/lottery-backend)。同一作者的前端仓库：[userwanyong/lottery-erp](https://github.com/userwanyong/lottery-erp)。2026-10-17 GitHub API 两者 license 均为 null，后端递归目录未发现 LICENSE、NOTICE、COPYING 或 README；本地两个 ZIP 未发现许可文件。前端 README 为 Ant Design Pro 使用说明，不能据此推定业务代码的授权。仍需核实作者另行授予的许可或适用授权条款。

[GitHub 许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) 区分了公开可见与开源许可。

## 可复现扫描

脚本：`scripts/audit_reference_overlap.py`。两个 `--reference` 参数分别指向原始 ZIP，`--output` 指向 JSON 结果。

扫描 Git 跟踪的 yuhui-server、yuhui-web、infra，文件至少 100 个 token；在所有同扩展名参考文件间寻找最高 5-token shingle Dice 值。保留字符串（含 URL），忽略注释、空白和 Java package/import。它是文本筛查工具，不是 AST、法务或独立创作证明。与改名后文件也比较，不仅匹配文件名。

| 项目 | 数量 |
|---|---:|
| 被计分文件 | 281 |
| Dice ≥ 0.8 的待复核文件 | 192 |
| 与某个参考文件字节完全一致 | 25 |
| 归一化 token 完全一致 | 70 |

这些集合存在包含关系，不应相加。通用框架、配置与 DTO 可能自然重合；未计分的小文件不代表没有重合。

## 优先复核对象

| 当前路径 | 重合指标 |
|---|---:|
| `yuhui-web/src/pages/RuleTreeEditor/index.tsx` | 0.9983 |
| `yuhui-web/src/services/api.ts` | 1.0000 |
| `infra/init/01-marketing_01.sql` | 0.9885 |
| `infra/init/02-marketing_02.sql` | 0.9885 |
| `yuhui-server/storage/src/main/java/com/yuhui/infrastructure/adapter/repository/ParticipationLedgerStore.java` | 0.8127 |
| `yuhui-web/src/pages/Account/Center/index.tsx` | 0.9963 |
| `yuhui-web/src/pages/User/Login/index.tsx` | 0.9981 |
| `infra/init/00-marketing.sql` | 0.9703 |
| `yuhui-server/storage/src/main/java/com/yuhui/infrastructure/adapter/repository/ErpRepositoryImpl.java` | 0.9447 |
| `yuhui-web/src/pages/StrategyAward/index.tsx` | 0.9955 |
| `yuhui-web/src/pages/Activity/index.tsx` | 0.9896 |
| `yuhui-web/src/pages/Auth/Users/index.tsx` | 0.9977 |
| `yuhui-web/src/services/typings.d.ts` | 0.9980 |
| `yuhui-web/src/pages/BehaviorRebate/index.tsx` | 0.9946 |
| `yuhui-web/src/pages/ActivitySku/index.tsx` | 0.9943 |
| `yuhui-web/src/pages/Auth/Roles/index.tsx` | 0.9884 |
| `yuhui-server/entrypoints/src/main/java/com/yuhui/trigger/http/LotteryActivityController.java` | 0.8678 |
| `yuhui-server/pom.xml` | 0.9075 |
| `yuhui-web/src/pages/Award/index.tsx` | 0.9962 |
| `yuhui-web/src/pages/RuleTree/index.tsx` | 0.9961 |

## 以维护性为目标的后续实现边界

1. 规则树编辑器：将图模型校验、节点/连线操作、布局与画布交互拆开，契约测试覆盖保存后重读、孤立节点及循环处理；不是移动原函数后宣称独立实现。
2. 运营配置：统一表单提交和错误状态，分离各资源字段与业务约束，保留原来的页面视觉和 API 行为。
3. API：分离传输层、契约、资源服务；未来静态演示适配同一契约，避免继续复制 HTTP 模板。
4. 参与及履约：保持库存、积分、事务、幂等与消息补偿边界，逐用例测试后再改结构。
5. 数据模型、SQL、通用 DTO：记录来源与必要兼容性，不为了降低分数修改真实数据含义。

## 公开状态

PUBLICATION_PERMISSION_CONFIRMED = NO（尚未确认，不表示已作侵权判定）
INDEPENDENT_IMPLEMENTATION_CONFIRMED = NO
SIMILARITY_AUDIT_COMPLETED = YES（限上述扫描范围）

即便只公开编译后前端文件，也不能把原始工程私有当作公开衍生作品的授权依据。

## 验证

审计脚本实际执行；手工断言验证字符串 URL 不被误当注释、Java 包及 import 变动被忽略、真正的字符串变化被保留。没有修改业务实现，因此未把历史功能测试冒充本轮重构验收。
