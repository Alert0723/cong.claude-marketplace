#!/bin/bash
# 获取当前版本、稳定版和最新版本
# 输出格式: current_version|stable_version|latest_version|latest_version_type
# latest_version_type: stable / beta / rc / alpha / next / other

set -e

# 获取当前版本
current_output=$(claude --version 2>/dev/null || echo "not installed")
current_version=$(echo "$current_output" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown")

# 获取 dist-tags
dist_tags=$(npm view @anthropic-ai/claude-code dist-tags --json 2>/dev/null || echo "{}")

# 获取稳定版和最新版本
stable_version=$(echo "$dist_tags" | sed -n 's/.*"stable".*:\s*"\([^"]*\)".*/\1/p')
latest_version=$(echo "$dist_tags" | sed -n 's/.*"latest".*:\s*"\([^"]*\)".*/\1/p')

# 设置默认值
[ -z "$stable_version" ] && stable_version="unknown"
[ -z "$latest_version" ] && latest_version="unknown"

# 判断 latest 版本类型
version_type="stable"
case "$latest_version" in
    *-beta.*) version_type="beta" ;;
    *-rc.*)   version_type="rc" ;;
    *-alpha.*) version_type="alpha" ;;
    *-nightly.*) version_type="nightly" ;;
    *-next.*) version_type="next" ;;
    *-[a-zA-Z]*.*) version_type="other" ;;
esac

# 输出结果
echo "$current_version|$stable_version|$latest_version|$version_type"
