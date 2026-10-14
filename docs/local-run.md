# 本地运行与环境

所有命令在仓库根目录执行。helper主要在macOS验证，Linux需自行设置JAVA_HOME并已启动Docker；Windows原生未验证。完整功能需要MySQL/Redis/RabbitMQ/ZooKeeper。

## 环境文件

local profile已经带有隔离演示配置，默认无需.env。配置位置：`yuhui-server/runtime/src/main/resources/application-local.properties` 与根 `compose.local.yml`。公开固定值 `yuhui_local_only` 仅用于本项目本机容器，属于非秘密演示值；脚本和验收使用同值。不要填入/复用生产密码。

如需研究非local历史环境，已有 `yuhui-server/runtime/.env.example`，其路径是历史应用运行目录约定，**不用于本次本地快速启动**。不能以仅复制该文件的方式宣称公网安全运行。

## Helper

```bash
export JAVA_HOME=/path/to/jdk-17
export PATH="$JAVA_HOME/bin:$PATH"
bash scripts/start.sh
DEMO_SEED=202610 python3 scripts/reset-demo-data.py
```

JAVA_HOME填写本机真实目录，不要直接使用占位路径。依赖包需网络可达。pnpm需预先安装，lockfile版本9；本机工具版本见verification/public-release/results.json。

## 手工启动（与helper相同入口）

```bash
docker compose -f compose.local.yml up -d mysql redis rabbitmq zookeeper
# 等待此命令成功后继续（连接失败时稍后重试）
docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysqladmin -uroot ping --silent
# 首次空卷自动应用infra/init；已有卷补应用03至06，再应用07
for sql in infra/init/03-local-entitlement.sql infra/init/04-bank-theme.sql infra/init/05-bank-rule-labels.sql infra/init/06-v3-operating.sql infra/migration/07-v3-final-patch.sql; do
  docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysql -uroot --default-character-set=utf8mb4 < "$sql"
done
mvn -f yuhui-server/pom.xml -Dmaven.test.skip=true package
(cd yuhui-web && pnpm install --frozen-lockfile && REPLICA_LOCAL=true pnpm run build)
```

终端A（仓库根目录）：

```bash
java -Xms128m -Xmx512m -jar yuhui-server/runtime/target/yuhui-server.jar --spring.profiles.active=local
```

等待后端Started Application，终端B运行：

```bash
node scripts/serve.mjs
```

终端C预热并初始化V3：

```bash
python3 scripts/warmup.py
DEMO_SEED=202610 python3 scripts/reset-demo-data.py
```

手工前台进程用Ctrl+C停止；helper启动进程用scripts/stop.sh。不要同时启动两份同端口服务，也不要删除现有Docker数据卷来绕过问题。start.sh的--no-build仅适用于本机已有构建。

## 质量验证

```bash
mvn -f yuhui-server/pom.xml -pl entrypoints -am test
(cd yuhui-web && pnpm run tsc && REPLICA_LOCAL=true pnpm run build)
python3 scripts/check-v3-final-patch.py
python3 scripts/check-v3.py
```

最后两条需要完整基础设施并重置全部V3合成数据。旧app课程样例被原配置跳过，不计为通过。CI没有运行完整集成验收，也没有部署功能。

本次发布使用独立 Compose 项目 yuhui-retail-banking-platform，与此前本地卷隔离。切换前先停止占用相同端口的旧服务；不删除旧数据卷。当前 DEMO_ONLY 密码为 yuhui_local_only。
