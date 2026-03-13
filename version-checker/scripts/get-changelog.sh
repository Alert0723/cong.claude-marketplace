#!/bin/bash
# 获取两个版本之间的更新日志
# 使用方法: ./get-changelog.sh <from-version> <to-version>
# 输出: 格式化的更新日志，每个功能一行

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 <from-version> <to-version>"
    exit 1
fi

FROM_VERSION=$1
TO_VERSION=$2

# 从 GitHub releases API 获取更新日志
releases=$(curl -s "https://api.github.com/repos/anthropics/claude-code/releases?per_page=50")

# 提取版本列表和对应的 body
# 格式: version|body
echo "$releases" | grep -A 100 '"tag_name":' | \
  awk '/"tag_name":/{v=$0; gsub(/.*"v?([0-9.]+)".*/, "\\1", v)} /"body":/{b=$0; gsub(/.*"body":\s*"/, "", b); gsub(/"$/, "", b); printf "%s|%s\n", v, b}' | \
  while read -r version body; do
    # 跳过无效版本
    [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] && continue

    # 检查版本是否在范围内
    if [ "$(printf '%s\n' "$version" "$FROM_VERSION" | sort -V | head -n1)" = "$FROM_VERSION" ] && \
       [ "$version" != "$FROM_VERSION" ]; then
      echo "=== v$version ==="
      # 提取以 - 开头的行（更新项）
      echo "$body" | grep -E '^\-' | sed 's/^- //' | head -20
    fi
  done
