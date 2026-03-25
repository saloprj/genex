#!/usr/bin/env bash
# Start local Postgres for dev (localhost:5434). Matches genex-deploy/.env.local credentials.
set -euo pipefail

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

echo "==> Local Postgres on port 5434 ..."
if docker ps --format '{{.Names}}' | grep -qx 'genex-local-postgres'; then
  echo "Already running (genex-local-postgres)."
  exit 0
fi

if docker ps -a --format '{{.Names}}' | grep -qx 'genex-local-postgres'; then
  docker start genex-local-postgres >/dev/null
  echo "Started existing container genex-local-postgres."
else
  docker run -d \
    --name genex-local-postgres \
    -e POSTGRES_USER=genexpep \
    -e POSTGRES_PASSWORD=G3n3xP3p!Pr0d2026 \
    -e POSTGRES_DB=genexpep \
    -p 5434:5432 \
    postgres:16-alpine >/dev/null
  echo "Created and started genex-local-postgres."
fi

echo "==> Waiting for Postgres ..."
for _ in {1..30}; do
  if docker exec genex-local-postgres pg_isready -U genexpep -d genexpep >/dev/null 2>&1; then
    echo "Ready. DATABASE_URL uses localhost:5434"
    exit 0
  fi
  sleep 1
done

echo "Error: Postgres did not become ready in time."
exit 1
