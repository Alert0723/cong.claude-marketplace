---
name: versioning
description: 当用户需要检查 Claude Code 版本、解析版本号、获取版本更新日志或处理版本相关的任务时激活
version: 1.1.0
---

# Version Management

本技能提供版本号解析、版本比较和更新日志获取的知识。

## Semver 版本号

Claude Code 使用语义化版本号格式：`MAJOR.MINOR.PATCH[-PRERELEASE]`

- **MAJOR**: 主版本号，不兼容的 API 修改
- **MINOR**: 次版本号，向下兼容的功能性新增
- **PATCH**: 修订号，向下兼容的问题修正
- **PRERELEASE** (可选): 预发布标识，如 `-beta.1`、`-rc.2`、`-alpha.1`

示例：
- `2.1.74` - 稳定版
- `2.2.0-beta.1` - Beta 测试版
- `2.2.0-rc.1` - Release Candidate 版本
- `2.2.0-alpha.1` - Alpha 版本

## 版本比较

使用字符串比较即可（因为是点分隔的数字）：

```bash
# 检查是否需要更新
if [ "$(printf '%s\n' "$latest" "$current" | sort -V | head -n1)" != "$current" ]; then
    # 有新版本
fi
```

## 获取版本信息

### 获取当前版本

```bash
claude --version
# 输出: 2.1.74 (Claude Code)
# 需要提取: echo "$output" | grep -oP '\d+\.\d+\.\d+'
```

### 获取最新版本（npm）

```bash
# 获取最新版本
npm view @anthropic-ai/claude-code version

# 获取 dist-tags（包含稳定版和测试版）
npm view @anthropic-ai/claude-code dist-tags --json
```

**dist-tags 说明**：
- `latest`: 最新发布的版本（默认安装）
- `stable`: 明确标记为稳定版的版本
- `next`: 下一个版本（通常是测试版）

### 获取最新版本（GitHub API）

```bash
curl -s "https://api.github.com/repos/anthropics/claude-code/releases?per_page=1" \
  | grep -oP '"tag_name":\s*"v\K[0-9.]+"'
```

## 获取更新日志

### 从 GitHub Releases API 获取

```bash
# 获取最新发布的 release
curl -s "https://api.github.com/repos/anthropics/claude-code/releases/latest"

# 获取所有 releases（分页）
curl -s "https://api.github.com/repos/anthropics/claude-code/releases?per_page=30"
```

**响应格式**：
```json
{
  "tag_name": "v2.1.74",
  "name": "v2.1.74",
  "body": "## What's changed\n\n- Feature 1\n- Fix 2\n..."
}
```

### 提取版本间的更新

获取从 `2.1.50` 到 `2.1.74` 之间的更新：

1. 获取所有 releases 列表
2. 筛选出在 2.1.50 之后的版本
3. 按时间倒序排列
4. 提取每个版本的 `body` 内容

## 更新日志格式化

将更新日志格式化为简洁的一句话总结：

- 识别 `body` 中的每个更新项（通常以 `-` 开头）
- 去除版本号和多余的空行
- 每个功能用一句话概括

示例：

**原始**：
```
## What's changed

- Added actionable suggestions to `/context` command — identifies context-heavy tools, memory bloat, and capacity warnings with specific optimization tips
- Fixed memory leak where streaming API response buffers were not released when the generator was terminated early
```

**格式化后**：
```
- /context 命令新增可操作建议
- 修复内存泄漏（流式 API 响应缓冲未释放）
```

## 配置文件格式

使用 YAML frontmatter 格式的 markdown 文件存储配置：

```markdown
---
# Version Checker 配置

check_frequency: daily  # 检查频率: always, daily, weekly, never
last_check_date: 2026-03-13  # 最后检查日期
check_beta: true  # 是否检查测试版: true/false
notification: true  # 是否使用桌面通知
---
```

## 日期比较

检查是否需要更新（基于频率）：

```bash
# 获取今天的日期
today=$(date +%Y-%m-%d)

# 获取配置的最后检查日期
last_check=$(grep "last_check_date:" .claude/version-checker.local.md | cut -d: -f2 | tr -d ' ')

# 检查频率
frequency=$(grep "check_frequency:" .claude/version-checker.local.md | cut -d: -f2 | tr -d ' ')

case $frequency in
  always)  # 总是检查
    need_check=true
    ;;
  daily)   # 每天检查
    if [[ "$today" > "$last_check" ]]; then
      need_check=true
    fi
    ;;
  weekly)  # 每周检查
    # 计算日期差
    ;;
  never)   # 不检查
    need_check=false
    ;;
esac
```

## 更新配置文件

检查完成后，更新 `last_check_date`：

```bash
sed -i "s/last_check_date:.*/last_check_date: $(date +%Y-%m-%d)/" .claude/version-checker.local.md
```

## 参考资源

详见 `scripts/` 目录中的辅助脚本：
- `get-versions.sh` - 获取版本信息（当前版本、稳定版、最新版本、版本类型）
- `get-changelog.sh` - 获取更新日志

## 版本类型检测

### 判断版本类型

根据版本号后缀判断版本类型：

| 版本号示例 | 类型 |
|-----------|------|
| `2.1.74` | `stable` 稳定版 |
| `2.2.0-beta.1` | `beta` 测试版 |
| `2.2.0-rc.1` | `rc` 候选发布版 |
| `2.2.0-alpha.1` | `alpha` 内测版 |
| `2.2.0-nightly.20250314` | `nightly` 每夜构建版 |
| `2.2.0-next.1` | `next` 下一个版本 |

### shell 脚本检测方法

```bash
version_type="stable"
case "$version" in
    *-beta.*)   version_type="beta" ;;
    *-rc.*)     version_type="rc" ;;
    *-alpha.*)  version_type="alpha" ;;
    *-nightly.*) version_type="nightly" ;;
    *-next.*)   version_type="next" ;;
    *-[a-zA-Z]*.*) version_type="other" ;;
esac
```

### get-versions.sh 输出格式

```
current_version|stable_version|latest_version|version_type
```

示例输出：
```
2.1.74|2.1.58|2.1.75|stable
2.1.74|2.1.74|2.2.0-beta.1|beta
```
