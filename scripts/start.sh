#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .runtime
if [ -z "${JAVA_HOME:-}" ]; then
  if [ -x "$HOME/.local/tools/jdk-17.0.18+8/Contents/Home/bin/java" ]; then
    export JAVA_HOME="$HOME/.local/tools/jdk-17.0.18+8/Contents/Home"
  else
    export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
  fi
fi
export PATH="$JAVA_HOME/bin:$PATH"
docker info >/dev/null 2>&1 || docker desktop start
docker compose -f compose.local.yml up -d mysql redis rabbitmq zookeeper
for attempt in $(seq 1 60); do
  if docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysqladmin -uroot ping --silent >/dev/null 2>&1; then break; fi
  sleep 1
done
docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysql -uroot < infra/init/03-local-entitlement.sql
docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysql -uroot --default-character-set=utf8mb4 < infra/init/04-bank-theme.sql
docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysql -uroot --default-character-set=utf8mb4 < infra/init/05-bank-rule-labels.sql
docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysql -uroot --default-character-set=utf8mb4 < infra/init/06-v3-operating.sql
docker compose -f compose.local.yml exec -T -e MYSQL_PWD=yuhui_local_only mysql mysql -uroot --default-character-set=utf8mb4 < infra/migration/07-v3-final-patch.sql
python3 scripts/processes.py stop
if [ "${1:-}" != '--no-build' ]; then
  mvn -f yuhui-server/pom.xml -Dmaven.test.skip=true package > .runtime/backend-build.log 2>&1
  (cd yuhui-web && pnpm install --frozen-lockfile && REPLICA_LOCAL=true npm run build) > .runtime/frontend-build.log 2>&1
fi
python3 scripts/processes.py start
python3 scripts/warmup.py
