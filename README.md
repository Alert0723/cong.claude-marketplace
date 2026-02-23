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
| `notification-windows` | Windows | Windows 桌面通知（PowerShell） |
| `notification-unix` | macOS/Linux | Unix 桌面通知（Shell） |
| `claude-hud` | 全平台 | 实时状态行 HUD - 显示上下文用量、工具活动、Agent 状态、待办事项等 |
| `claude-mem` | 全平台 | 持久化内存系统 - 跨会话上下文压缩与记忆 |
| `pdf2skills` | 全平台 | PDF 转 Claude 技能 - 自动提取内容并生成技能目录 |
| `plugin-dev` | 全平台 | 插件开发工具包 - Hooks、MCP、Commands、Agents、Skills 开发指南 |

---

## 📢 Notification Plugin

桌面通知插件，在以下场景发送系统通知（仅当终端在后台时触发）：

- **权限请求** - 需要用户确认权限时
- **任务完成** - Claude 完成任务时

### 安装

```bash
# Windows
/plugin install notification-windows@cong.claude-marketplace

# macOS/Linux
/plugin install notification-unix@cong.claude-marketplace
```

### 初始化配置

```bash
/notification-config
```

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `bark_url` | string | 空 | Bark 推送地址 |
| `bark_only` | boolean | false | 仅使用 Bark 推送 |
| `timeout` | number | 3000 | 通知显示时长(毫秒) |
| `always_notify` | boolean | false | 始终通知 |

### 功能特点

- 智能检测终端窗口状态
- 支持系统通知和 Bark 推送
- AI 主动通知集成
- 丰富参数支持（紧急通知、消息分组、自定义铃声等）

详见 [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md)

---

## 📊 claude-hud

实时状态行 HUD 插件，显示：

- 当前模型和订阅类型
- 上下文使用情况（令牌用量）
- 5小时和7天使用额度（含重置时间）
- Git 状态
- 工具活动状态
- 运行中的 Agent 状态
- 待办事项进度
- Max5/Max20 终端检测

### 安装

```bash
/plugin install claude-hud@cong.claude-marketplace

# 配置状态行
/claude-hud:setup
```

### 显示示例

```
[Opus 4.5 | Pro] █████░░░░░ 45% 90k/200k │ my-project git:(main) │ 5h: 25% (3h 28m) │ 7d: 51% (Resets Fri 12:30 PM) │ ⏱️ 5m
✓ Read ×3 | ✓ Edit ×1
◐ explore [haiku]: Finding auth code (2m 15s)
▸ Fix authentication bug (2/5)
```

### 配置选项

```bash
/claude-hud:configure
```

- 显示/隐藏工具活动行
- 显示/隐藏 Agent 状态行
- 显示/隐藏待办事项进度行
- 调整项目路径显示层级
- 切换布局样式（默认/分隔符）

### 增强特性（vs 原版）

| 功能 | 原版 | 增强版 |
|------|------|--------|
| 7天使用额度 | 仅≥80%时显示 | **始终显示** |
| 5小时重置 | 基础倒计时 | **重置时间** (如 "20:32") |
| 7天重置 | 不显示 | **日期/时间** (如 "Resets Fri 12:30 PM") |
| 凭据源 | 仅文件 | **文件 + macOS Keychain** |
| 终端检测 | ❌ | ✅ Max5/Max20 |

---

## 🧠 claude-mem

Claude Code 持久化内存系统，实现跨会话上下文压缩与记忆。

### 安装

```bash
/plugin install claude-mem@cong.claude-marketplace
```

### 功能特性

- 跨会话上下文压缩
- 多种 Agent 模式支持
- 多语言模式（Python、TypeScript、Go 等）
- MCP 集成
- 可视化界面

### 组件

- **Agents** - 专业处理代理
- **Commands** - 命令系统
- **Hooks** - 事件钩子
- **Modes** - 多语言模式配置
- **Skills** - 技能定义

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
