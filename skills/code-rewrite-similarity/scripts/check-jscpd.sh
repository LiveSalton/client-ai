#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "用法: $0 <旧代码路径> <新代码路径> <报告目录> [最小行数] [最小token数]"
  echo "示例: $0 ./old/src ./new/src ./reports/jscpd 5 50"
  exit 1
fi

OLD_PATH="$1"
NEW_PATH="$2"
REPORT_DIR="$3"
MIN_LINES="${4:-5}"
MIN_TOKENS="${5:-50}"

mkdir -p "$REPORT_DIR"

if ! command -v jscpd >/dev/null 2>&1; then
  echo "未检测到 jscpd。请先安装: npm install -g jscpd"
  exit 2
fi

jscpd "$OLD_PATH" "$NEW_PATH" \
  --min-lines "$MIN_LINES" \
  --min-tokens "$MIN_TOKENS" \
  --reporters html,console,json \
  --output "$REPORT_DIR"

echo "jscpd 报告已生成: $REPORT_DIR"
