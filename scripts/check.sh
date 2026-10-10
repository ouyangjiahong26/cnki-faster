#!/usr/bin/env bash
# 本地检查入口，与 CI 的 lint、test 两个 job 保持一致：
# JS 语法、manifest 校验、web-ext lint、规则测试
set -euo pipefail
cd "$(dirname "$0")/.."

status=0
for f in extension/*.js; do
  node --check "$f" || status=1
done
if [ "$status" -eq 0 ]; then
  echo "JS 语法 OK"
fi

python3 -m json.tool extension/manifest.json > /dev/null && echo "manifest OK"

if command -v npx > /dev/null 2>&1; then
  npx --yes web-ext@8 lint -s extension
else
  echo "跳过 web-ext lint（本机无 npx）"
fi

node --test tests/rules.test.mjs
