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
| `lua-lsp` | 全平台 | Lua 语言服务器 - 提供代码智能和诊断支持 |
| `csharp-lsp` | 全平台 | C# 语言服务器 - 提供代码智能和诊断支持 |
| `claude-md-management` | 全平台 | CLAUDE.md 管理工具 - 审计质量、捕获学习内容、保持项目记忆更新 |
| `safe-bash` | 全平台 | 安全 Bash Hook - 只读命令自动放行，三层防护机制 |
| `lark-docs` | 全平台 | 飞书云文档联动 - 通过 MCP 实现云文档和多维表格的自主操作 |

---

## 📢 notification

跨平台桌面通知插件（Windows / macOS / Linux），在以下场景发送系统通知（仅当终端在后台时触发）：

- **权限请求** - 需要用户确认权限时
- **任务完成** - Claude 完成任务时

### 通知内容

通知包含：
- **对话名称** - 会话 ID 前 8 位（如 `[abc12345]`）
- **会话状态** - 结束原因（手动结束/超时/错误/完成）
- **最后消息** - 最后一条用户消息摘要（前 100 字符）
- **项目目录** - 当前项目路径

示例：`Claude Code - [abc12345]` / `会话已完成 - 修复登录 bug - cong.claude-marketplace`

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

### 卸载

```bash
/notification:uninstall
```

此命令将：
1. 卸载协议处理器（Windows 注册表 / Linux xdg-mime）
2. 卸载插件文件
3. 可选卸载 terminal-notifier（macOS）

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

### 卸载

```bash
/claude-hud:uninstall
```

此命令将：
1. 从设置中移除 statusline 配置
2. 删除 claude-hud 配置文件
3. 卸载插件文件

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

## 🌙 lua-lsp

Lua 语言服务器插件，提供代码智能和诊断支持。

### 安装

```bash
/plugin install lua-lsp@cong.claude-marketplace
```

### 安装语言服务器

此插件需要安装 Lua 语言服务器：

#### macOS (Homebrew)

```bash
brew install lua-language-server
```

#### Linux (Ubuntu/Debian - Snap)

```bash
sudo snap install lua-language-server --classic
```

#### Linux (Arch Linux)

```bash
sudo pacman -S lua-language-server
```

#### Linux (Fedora)

```bash
sudo dnf install lua-language-server
```

#### 手动安装

从 [GitHub releases](https://github.com/LuaLS/lua-language-server/releases) 下载预编译二进制文件。

### 支持的文件扩展名

- `.lua`

### 更多信息

- [Lua Language Server GitHub](https://github.com/LuaLS/lua-language-server)
- [官方文档](https://luals.github.io/)

---

## 💜 csharp-lsp

C# 语言服务器插件，提供代码智能和诊断支持。

### 安装

```bash
/plugin install csharp-lsp@cong.claude-marketplace
```

### 安装语言服务器

此插件需要安装 C# 语言服务器。

#### .NET 工具（推荐）

```bash
dotnet tool install --global csharp-ls
```

#### macOS (Homebrew)

```bash
brew install csharp-ls
```

### 系统要求

- .NET SDK 6.0 或更高版本

### 支持的文件扩展名

- `.cs`

### 更多信息

- [csharp-ls GitHub](https://github.com/razzmatazz/csharp-language-server)
- [.NET SDK 下载](https://dotnet.microsoft.com/download)

---

## 📝 claude-md-management

CLAUDE.md 管理工具，用于审计质量、捕获学习内容并保持项目记忆更新。

### 安装

```bash
/plugin install claude-md-management@cong.claude-marketplace
```

### 功能特性

两个互补的工具，用于不同目的：

| | claude-md-improver (技能) | /revise-claude-md (命令) |
|---|---|---|
| **用途** | 保持 CLAUDE.md 与代码库一致 | 捕获会话学习内容 |
| **触发方式** | 代码库变更 | 会话结束 |
| **使用时机** | 定期维护 | 会话中发现缺少上下文时 |

### 使用方法

#### 技能：claude-md-improver

审计 CLAUDE.md 文件与当前代码库状态的对齐情况：

```
"审计我的 CLAUDE.md 文件"
"检查我的 CLAUDE.md 是否最新"
```

#### 命令：/revise-claude-md

从当前会话中捕获学习内容：

```
/revise-claude-md
```

---

## 🛡️ safe-bash

安全 Bash Hook - 只读命令自动放行，三层防护机制保护您的系统安全。

### 安装

```bash
/plugin install safe-bash@cong.claude-marketplace
```

### 工作原理

插件使用三层防护机制来判断 Bash 命令是否需要用户确认：

#### 第一层：危险模式检测

检测命令是否包含危险标志：
- `--force`, `-f` (强制操作)
- `--yes`, `-y` (自动确认)
- `--dangerously-disable-sandbox` (禁用沙盒)
- `--no-verify` (跳过验证)
- `--skip-hooks` (跳过钩子)
- `--hard` (硬重置)
- `--recursive`, `-r` (递归删除)
- `rm` (删除命令)
- `>` (输出重定向覆盖文件)
- `>/dev/null` (丢弃错误/输出)

#### 第二层：黑名单拦截

阻止已知的危险命令：
- **文件删除**：`rm`, `rmdir`, `shred`, `srm`
- **文件修改**：`touch`, `truncate`, `chmod +w`, `chown`
- **数据库破坏**：`DROP`, `DELETE`, `TRUNCATE`
- **Git 危险操作**：`git reset --hard`, `git clean -fd`, `git branch -D`
- **系统修改**：`systemctl stop`, `kill -9`

#### 第三层：白名单放行

以下只读命令会自动放行，无需确认：
- **查看文件**：`cat`, `head`, `tail`, `less`, `more`, `bat`, `grep`, `rg`, `find` (不含 -delete)
- **查看目录**：`ls`, `ll`, `l`, `dir`, `tree` (不含删除参数)
- **Git 查看**：`git status`, `git log`, `git show`, `git diff`, `git branch` (不含 -D)
- **信息查看**：`echo`, `pwd`, `whoami`, `which`, `type`, `command -v`
- **测试命令**：`test`, `[`, `[[`
- **网络查看**：`curl` (仅 GET 请求), `wget` (仅查看标志)
- **进程查看**：`ps`, `top`, `htop`, `pgrep`
- **端口查看**：`netstat`, `lsof`, `ss`

### 使用示例

#### 自动放行的命令（无需确认）

```bash
# 查看文件
cat package.json
grep -r "TODO" src/

# 查看目录
ls -la
find src -name "*.ts"

# Git 查看
git status
git log --oneline

# 系统信息
pwd
whoami
```

#### 需要确认的命令

```bash
# 危险标志
rm -rf node_modules
git push --force

# 黑名单命令
touch test.txt
chmod +w script.sh
```

### 配置

插件自动工作，无需额外配置。如需自定义行为，可以编辑 `hooks/hooks.json` 文件。

### 注意事项

- Hook 会在 Claude Code 启动时加载，修改配置后需要重启
- 在 `ask` 模式下工作最佳，其他模式可能表现不同
- 建议配合其他安全措施一起使用

---

## 📋 lark-docs

飞书云文档联动插件，通过飞书 MCP 实现云文档和多维表格的自主操作。

> **重要**: 本插件使用第三方 [lark-office-mcp](https://github.com/YSzEthan/lark-office-mcp) 而非官方 `@larksuiteoapi/lark-mcp`，因为官方的 `docx_builtin_import` **不支持** `folder_token` 参数。而 `lark-office-mcp` 的 `doc_create` 工具 **完全支持** `folder_token` 参数，可以精确指定文档创建位置。

### 安装

```bash
/plugin install lark-docs@cong.claude-marketplace
```

### 配置飞书 MCP

```bash
/lark-docs:install
```

按提示输入飞书开放平台的 App_ID、App_Secret 和 FolderToken。

### 查看配置状态

```bash
/lark-docs:status
```

### 移除配置

```bash
/lark-docs:uninstall
```

### 功能特性

- **云文档操作** - 创建、读取、编辑飞书云文档
- **多维表格操作** - 记录的增删改查
- **智能识别** - 自动识别飞书文档相关需求
- **Agent 自主执行** - lark-docs-agent 可自主处理飞书文档任务
- **Windows 编码处理** - 自动处理 Windows 环境下中文 JSON 编码问题
- **权限自动设置** - 创建文档后自动设置访问权限
- **✅ 支持指定文件夹创建文档** - 使用 `doc_create` + `folder_token` 实现精确控制文档位置

### 前置要求

1. 飞书开放平台账号
2. 已创建飞书应用并获取 App_ID 和 App_Secret
3. 应用已开通文档/多维表格相关权限

### 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 在「凭证与基础信息」页面获取 App ID 和 App Secret
4. 在「权限管理」中开通所需权限（如 `docs:doc`, `bitable:record` 等）

### 使用示例

```
用户: "在飞书文档中创建一份会议纪要"
用户: "把项目进度更新到飞书多维表格"
用户: "读取那个 bitable 看看有哪些待办事项"
```

### v0.6.0 更新

- **重要变更**: 切换到 lark-office-mcp（第三方），支持 `folder_token` 参数
- **新增**: 支持指定文件夹创建文档，文档会创建在用户指定的目录下
- **修复**: 官方 lark-mcp 的 `docx_builtin_import` 不支持 `folder_token` 的问题

### v0.4.0 更新

- **重构**：SKILL.md 和 Agent 内容国际化（英文主体+中文关键词）
- **优化**：创建 `references/` 目录，分离详细参考内容
- **精简**：SKILL.md 从 174 行优化到约 100 行
- **精简**：Agent 从 381 行优化到约 150 行
- **新增**：`references/block-types.md` - 完整 Block 类型对照表
- **新增**：`references/create-document-example.md` - 完整 PowerShell 示例

### v0.3.0 更新

- **修复**：Windows 环境下中文乱码问题（使用 UTF-8 无 BOM 文件）
- **修复**：文档链接"页面不存在"问题（创建后自动设置权限）
- **优化**：提升文档生成效率，内置 Block 类型速查表
- **升级**：Agent 模型从 haiku 升级到 sonnet

---

## 许可证

MIT License

## 作者

conghuang - https://github.com/Alert0723
