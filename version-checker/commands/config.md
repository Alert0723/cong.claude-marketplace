---
description: 配置 Version Checker 的检查频率和通知设置
allowed-tools: Read, Write, AskUserQuestion
---

# Configure Version Checker

**FIRST**: 使用 Read 工具加载项目目录中的 `.claude/version-checker.local.md`（如果存在）。

存储当前值并记录配置是否存在（决定使用哪种流程）。

---

## 两种流程

### 流程 A：新用户（无配置文件）
使用默认值进行配置，让用户选择需要的选项

### 流程 B：更新配置（配置文件已存在）
从现有配置开始，允许用户修改选项

---

## 流程 A：新用户（2 个问题）

### Q1: 检查频率
- header: "检查频率"
- question: "选择版本检查频率："
- multiSelect: false
- options:
  - "每天检查（推荐）" - 每天启动时检查一次更新，平衡及时性和性能
  - "每次启动检查" - 每次启动 Claude Code 都检查，确保第一时间获知更新
  - "每周检查" - 每周检查一次，减少检查频率
  - "不自动检查" - 不自动检查，只通过 `/version-check` 命令手动检查

### Q2: 通知方式
- header: "通知方式"
- question: "选择更新通知方式："
- multiSelect: false
- options:
  - "桌面通知（推荐）" - 使用系统桌面通知（需要安装 notification 插件）
  - "终端显示" - 在终端中直接显示更新提示

---

## 流程 B：更新配置（2 个问题）

### Q1: 检查频率
- header: "检查频率"
- question: "选择版本检查频率："
- multiSelect: false
- options:
  - "每天检查" - 每天启动时检查一次更新
  - "每次启动检查" - 每次启动 Claude Code 都检查
  - "每周检查" - 每周检查一次
  - "不自动检查" - 不自动检查，只通过 `/version-check` 命令手动检查

### Q2: 通知方式
- header: "通知方式"
- question: "选择更新通知方式："
- multiSelect: false
- options:
  - "桌面通知" - 使用系统桌面通知（需要安装 notification 插件）
  - "终端显示" - 在终端中直接显示更新提示

---

## 配置映射

| 选项 | 配置值 |
|------|--------|
| 每天检查 | `check_frequency: daily` |
| 每次启动检查 | `check_frequency: always` |
| 每周检查 | `check_frequency: weekly` |
| 不自动检查 | `check_frequency: never` |
| 桌面通知 | `notification: true` |
| 终端显示 | `notification: false` |

---

## 写入配置前验证

**不要写入配置，如果：**
- 用户取消（Esc）→ 显示"配置已取消。"
- 配置与当前值相同 → 显示"无需更改，配置保持不变。"

**保存前显示预览：**

```
配置预览：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检查频率：每天检查
通知方式：桌面通知

是否保存这些更改？
```

---

## 写入配置文件

写入到项目目录的 `.claude/version-checker.local.md`。

如果配置文件已存在，保留 `last_check_date` 的当前值（如果存在），不进行修改。

**新用户配置文件格式：**
```markdown
---
# Version Checker 配置

check_frequency: daily
last_check_date: 2026-03-14
notification: true
---

配置说明

将此文件复制到您的项目目录 `.claude/version-checker.local.md` 即可生效。
```

**更新现有配置文件时：**
- 保留所有现有内容（包括说明部分）
- 只更新 `check_frequency` 和 `notification` 的值
- 保留现有的 `last_check_date` 值

---

## 写入后

显示："配置已保存！Version Checker 将按照新设置运行。"
