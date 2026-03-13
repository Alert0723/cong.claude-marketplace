#!/bin/bash
# 获取当前版本和最新版本
# 输出格式: current_version|latest_version

set -e

# 获取当前版本
current_output=$(claude --version 2>/dev/null || echo "not installed")
current_version=$(echo "$current_output" | grep -oP '\d+\.\d+\.\d+' || echo "unknown")

# 获取最新版本
latest_version=$(npm view @anthropic-ai/claude-code version 2>/dev/null || echo "unknown")

# 输出结果
echo "$current_version|$latest_version"
