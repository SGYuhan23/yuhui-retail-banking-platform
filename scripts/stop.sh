#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/processes.py stop
docker compose -f compose.local.yml stop mysql redis rabbitmq zookeeper
