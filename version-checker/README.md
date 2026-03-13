# Version Checker

Claude Code 版本检查与更新工具 - 检查最新版本、显示更新差异、支持手动和自动更新检查。

## 功能特性

- 手动检查 Claude Code 版本更新
- 显示当前版本和最新版本
- 一句话高度总结更新差异
- 支持更新到指定版本
- 自动检查新版本（启动时触发）
- 可配置检查频率（每次启动/每天/每周）
- 仅在有新版本时显示提示，无更新时不打扰

## 安装

```bash
# 从市场安装
/plugin install version-checker@cong.claude-marketplace
```

## 配置

在项目根目录创建 `.claude/version-checker.local.md` 文件：

```markdown
---
# Version Checker 配置

check_frequency: daily  # 检查频率: always, daily, weekly, never
last_check_date: 2026-03-13  # 最后检查日期（自动更新）

# 提示方式
notification: true  # 是否使用桌面通知（如果已安装 notification 插件）
---
```

**配置选项**：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `check_frequency` | string | `daily` | 检查频率：`always`（每次启动）、`daily`（每天）、`weekly`（每周）、`never`（从不） |
| `last_check_date` | string | 自动设置 | 最后检查日期，插件自动维护 |
| `notification` | boolean | `true` | 是否使用桌面通知（需要安装 notification 插件） |

## 使用

### 手动检查版本

```bash
# 检查版本更新
/version-check

# 更新到指定版本
/version-check --version 2.1.70
```

### 自动检查

插件会在以下情况自动检查版本：
- 根据配置的检查频率
- 仅在有新版本时显示提示
- 无更新时不做任何反馈

## 工作原理

1. 获取当前 Claude Code 版本：`claude --version`
2. 从 npm registry 获取最新版本
3. 从 GitHub releases API 获取更新日志
4. 格式化更新差异（每个功能一句话）
5. 提示用户更新意向

## 许可证

MIT License
