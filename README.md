# Claude Code Marketplace

> 收录自用的 Claude Code 插件，便于备份管理

## 快速开始

### 安装市场

```bash
# 在 Claude Code 输入框中添加市场
/plugin marketplace add https://github.com/Alert0723/cong.claude-marketplace
```

### 更新市场

```bash
/plugin marketplace update cong.claude-marketplace
```

> **注意**: 安装或更新插件后需要重启 Claude Code 才能生效。

---

## 插件列表

| 插件 | 平台 | 说明 |
|------|------|------|
| `notification` | 全平台 | 桌面通知（Windows / macOS / Linux） |
| `claude-hud` | 全平台 | 实时状态行 HUD - 显示上下文用量、工具活动、Agent 状态等 |
| `pdf2skills` | 全平台 | PDF 转 Claude 技能 - 自动提取内容并生成技能目录 |
| `plugin-dev` | 全平台 | 插件开发工具包 - Hooks、MCP、Commands、Agents、Skills 开发指南 |
| `version-checker` | 全平台 | Claude Code 版本检查与更新工具 |
| `superpowers` | 全平台 | Claude Code 核心技能库 - TDD、调试、协作模式和最佳实践工作流 |

---

## 📢 notification

跨平台桌面通知插件（Windows / macOS / Linux），在以下场景发送系统通知（仅当终端在后台时触发）：

- **权限请求** - 需要用户确认权限时
- **任务完成** - Claude 完成任务时

### 安装

```bash
/plugin install notification@cong.claude-marketplace
```

### 点击激活（跳转到对应会话）

安装后自动配置，手动重装：

```bash
/notification:install
```

- **Windows**：注册 `claude://` 注册表协议，点击通知的"打开会话"按钮直接激活对应终端窗口
- **macOS**：通过 `terminal-notifier` 实现，自动通过 Homebrew 安装
- **Linux**：通过 `xdg-mime` 注册 `claude://` 协议，需安装 `wmctrl` 或 `xdotool`

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `bark_url` | string | 空 | Bark 推送地址（iOS 推送） |
| `bark_only` | boolean | false | 仅使用 Bark，跳过系统通知 |
| `timeout` | number | 3000 | 通知显示时长（毫秒，仅 Linux 有效） |
| `always_notify` | boolean | false | 始终通知（包括终端在前台时） |

配置文件位置：`.claude/cong.claude-marketplace.local.md`

### Bark 推送

```bash
# macOS / Linux
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.sh" -u "URL" -m "消息" -t "标题"

# Windows
powershell -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.ps1" -Url "URL" -Message "消息" -Title "标题"
```

更好的方式是从项目配置文件读取 Bark URL：

```bash
# 1. 检查配置文件是否存在
if [ -f ".claude/cong.claude-marketplace.local.md" ]; then
    # 2. 提取 bark_url
    BARK_URL=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' .claude/cong.claude-marketplace.local.md | grep '^bark_url:' | sed 's/bark_url: *//' | sed 's/^"\(.*\)"$/\1/')

    # 3. 如果配置了 Bark，发送通知
    if [ -n "$BARK_URL" ]; then
        bash ~/.claude/plugins/cache/cong.claude-marketplace/*/skills/notification-config/scripts/bark.sh -u "$BARK_URL" -t "Claude Code" -m "任务已完成"
    fi
fi
```



---

## 📊 claude-hud

实时状态行 HUD 插件，显示：

- 当前模型和订阅类型
- 上下文使用情况（令牌用量）
- 使用额度（5小时/7天）
- Git 状态
- 工具活动状态
- 运行中的 Agent 状态
- 待办事项进度

### 安装

```bash
/plugin install claude-hud@cong.claude-marketplace

# 配置状态行
/claude-hud:setup
```

### 显示示例

```
[Opus | Max] │ my-project git:(main*)
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
```

### 配置选项

```bash
/claude-hud:configure
```

- 显示/隐藏工具活动行
- 显示/隐藏 Agent 状态行
- 显示/隐藏待办事项进度行
- 显示/隐藏环境配置计数行

---

## 📄 pdf2skills

将 PDF 文档转换为 Claude 技能的插件，支持自动提取内容并生成技能目录结构。

### 安装

```bash
/plugin install pdf2skills@cong.claude-marketplace
```

### 环境配置

```bash
/pdf2skills:setup
```

需要配置：
- **SiliconFlow API** - LLM 处理（https://siliconflow.cn/）
- **MinerU API** - PDF 转 Markdown（https://mineru.net/）

### 使用命令

```bash
# 转换 PDF 为 Claude 技能
/pdf2skills:convert <pdf文件>

# 指定输出目录
/pdf2skills:convert <pdf文件> --output-dir ./output

# 指定语言
/pdf2skills:convert <pdf文件> --language ch

# 恢复模式（中断后继续）
/pdf2skills:convert <pdf文件> --resume
```

### 输出结构

```
<输出目录>/
├── full.md                          # 提取的 Markdown
├── full_chunks/                     # 分块文档
├── full_chunks_density/             # 语义分析
└── full_chunks_skus/                # 知识单元
    ├── skus/                        # 单个 SKU 文件
    ├── buckets.json                 # 分组 SKU
    ├── router.json                  # 层次化路由
    ├── glossary.json                # 领域术语表
    └── generated_skills/            # Claude 技能
        ├── index.md                 # 技能导航
        └── <技能名称>/SKILL.md      # 单个技能文件
```

---

## 🔄 version-checker

Claude Code 版本检查与更新工具，支持区分稳定版和测试版，自动检查最新版本并显示更新差异。

### 安装

```bash
/plugin install version-checker@cong.claude-marketplace
```

### 主要命令

```bash
# 检查版本更新（手动触发）
/version-check

# 配置检查频率、测试版检查和通知方式
/version-checker:config
```

### 配置选项

运行 `/version-checker:config` 可配置：

| 配置项 | 选项 | 说明 |
|--------|------|------|
| **检查频率** | 每天检查 | 每天启动时检查一次（推荐） |
| | 每次启动检查 | 每次启动都检查 |
| | 每周检查 | 每周检查一次 |
| | 不自动检查 | 仅通过命令手动检查 |
| **测试版检查** | 启用 | 同时检查稳定版和测试版 |
| | 禁用 | 仅检查稳定版 |
| **通知方式** | 桌面通知 | 使用系统桌面通知（需要 notification 插件） |
| | 终端显示 | 在终端中直接显示更新提示 |

### 版本类型检测

插件会自动区分版本类型：
- **稳定版**（stable）：正式发布的稳定版本
- **测试版**（beta/rc/alpha）：预发布版本
- **每夜构建**（nightly）：每日开发版本
- **其他预发布**（other/next）：其他预发布类型

当有测试版可用时，会同时显示稳定版和测试版信息，用户可选择更新到稳定版或测试版。

### 自动检查

插件会在每次会话开始时自动检查版本更新（根据配置频率），发现新版本时会：
- 显示版本号和更新差异
- 询问是否更新到最新版本或指定版本
- 根据配置决定是否显示测试版更新

配置文件位置：`.claude/version-checker.local.md`

---

## ⚡ Superpowers

Claude Code 核心技能库，提供完整的软件开发生命周期工作流。

### 安装

```bash
/plugin install superpowers@cong.claude-marketplace
```

### 工作流程

1. **brainstorming** - 编写代码前激活，通过问题细化想法，探索替代方案，展示设计以供验证

2. **using-git-worktrees** - 设计批准后激活，在新分支创建隔离工作区，运行项目设置，验证干净的测试基线

3. **writing-plans** - 使用批准的设计激活，将工作分解为小块任务（每个 2-5 分钟），每个任务都有确切的文件路径、完整代码和验证步骤

4. **subagent-driven-development** 或 **executing-plans** - 使用计划激活，为每个任务派遣全新的子代理，进行两阶段审查（规范合规性，然后代码质量），或使用人工检查点批量执行

5. **test-driven-development** - 实施期间激活，强制执行 RED-GREEN-REFACTOR：编写失败的测试，看它失败，编写最小代码，看它通过，提交

6. **requesting-code-review** - 任务之间激活，对照计划进行审查，按严重程度报告问题

7. **finishing-a-development-branch** - 任务完成时激活，验证测试，提供选项（合并/PR/保留/丢弃），清理工作树

### 核心技能

#### 测试
- **test-driven-development** - RED-GREEN-REFACTOR 循环

#### 调试
- **systematic-debugging** - 4 阶段根本原因过程
- **verification-before-completion** - 确保真正修复

#### 协作
- **brainstorming** - 苏格拉底式设计细化
- **writing-plans** - 详细实施计划
- **executing-plans** - 带检查点的批量执行
- **dispatching-parallel-agents** - 并发子代理工作流
- **requesting-code-review** - 预审查检查清单
- **receiving-code-review** - 回应反馈
- **using-git-worktrees** - 并行开发分支
- **finishing-a-development-branch** - 合并/PR 决策工作流
- **subagent-driven-development** - 快速迭代与两阶段审查

#### 元技能
- **writing-skills** - 创建遵循最佳实践的新技能
- **using-superpowers** - 技能系统介绍

### 哲学

- **测试驱动开发** - 始终先写测试
- **系统化而非临时** - 过程优于猜测
- **减少复杂性** - 简单性为主要目标
- **证据优于声明** - 在声明成功之前验证

---

## 🛠️ Plugin Development Toolkit (plugin-dev)

Claude Code 官方插件开发工具包，提供完整的插件开发指南和最佳实践。

### 安装

```bash
/plugin install plugin-dev@cong.claude-marketplace
```

### 功能特性

#### 7 大核心技能

1. **Hook Development** - 事件驱动自动化和高级 Hooks API
2. **MCP Integration** - Model Context Protocol 服务器集成
3. **Plugin Structure** - 插件组织结构和清单配置
4. **Plugin Settings** - 使用 `.claude/plugin-name.local.md` 的配置模式
5. **Command Development** - 创建带前置元数据和参数的斜杠命令
6. **Agent Development** - 创建自主 Agent
7. **Skill Development** - 创建具有渐进式披露的技能

#### 3 个专业 Agent

- **agent-creator** - 帮助设计和构建专业 Agent
- **plugin-validator** - 验证插件结构和配置
- **skill-reviewer** - 审查 Agent Skill 实现

#### 创建命令

```bash
/plugin-dev:create-plugin

# 或提供初始描述
/plugin-dev:create-plugin 一个用于管理数据库迁移的插件
```

8 阶段引导式工作流：
1. Discovery - 了解插件目的和需求
2. Component Planning - 确定需要的组件
3. Detailed Design - 指定每个组件
4. Structure Creation - 设置目录和清单
5. Component Implementation - 创建每个组件
6. Validation - 运行验证检查
7. Testing - 验证插件
8. Documentation - 完成 README

---

## 许可证

MIT License

## 作者

conghuang - https://github.com/Alert0723
