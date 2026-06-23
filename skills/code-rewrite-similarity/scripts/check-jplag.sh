#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 5 ]; then
  echo "用法: $0 <jplag-jar路径> <语言> <报告目录> <旧代码路径> <新代码路径>"
  echo "示例: $0 ./jplag.jar typescript ./reports/jplag ./old/src ./new/src"
  exit 1
fi

JPLAG_JAR="$1"
LANGUAGE="$2"
REPORT_DIR="$3"
OLD_PATH="$4"
NEW_PATH="$5"

mkdir -p "$REPORT_DIR"

if [ ! -f "$JPLAG_JAR" ]; then
  echo "未找到 JPlag jar 文件: $JPLAG_JAR"
  exit 2
fi

java -jar "$JPLAG_JAR" \
  -l "$LANGUAGE" \
  -r "$REPORT_DIR" \
  "$OLD_PATH" "$NEW_PATH"

echo "JPlag 报告已生成: $REPORT_DIR"
