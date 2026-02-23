## 通知功能配置

### 当前配置
* 使用 Windows 系统通知
* Bark 推送：未配置（如需配置，请更新 `.claude/cong.claude-marketplace.local.md` 中的 `bark_url`）

### 主动通知场景
AI 应该在以下场景主动发送通知：
1. **长时间任务完成** - 构建、测试、部署等耗时任务完成时
2. **需要用户确认** - 重要决策或需要用户介入时
3. **重要里程碑** - 代码审查完成、PR 创建成功等
4. **错误警报** - 构建失败、测试未通过等异常情况

### 发送通知方法
使用 Bash 工具调用 notify.ps1 脚本：

```powershell
# 系统通知
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\conghuang\.claude\plugins\cache\cong-claude-marketplace\notification-windows\1.2.6/skills/notification-config/scripts/notify.ps1" -Title "Claude Code" -Message "任务完成"
```

### 使用原则
* 在用户明确要求通知时发送
* 完成重要任务后主动发送（如代码审查、PR创建、长时间构建等）
* 相关任务使用相同的标题进行分组

## claude-hud 插件

### 功能概述
claude-hud 是一个实时状态行 HUD 插件，显示以下信息：
* 上下文使用情况（令牌用量）
* 工具活动状态
* 运行中的 Agent 状态
* 待办事项进度

### 安装与配置
1. 插件已集成到市场，可通过 `/plugin install claude-hud` 安装
2. 安装后运行 `/claude-hud:setup` 配置状态行
3. 使用 `/claude-hud:configure` 自定义显示选项

### 显示内容
默认显示两行：
```
[Opus | Max] │ my-project git:(main*)
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
```

可选显示行（通过配置启用）：
* 工具活动行
* Agent 状态行
* 待办事项进度行
* 环境配置计数行

## pdf2skills 插件

### 功能概述
pdf2skills 是一个将PDF文档转换为Claude技能的插件，支持以下功能：
* PDF到Markdown转换（使用MinerU API）
* 语义分块与密度分析
* 知识单元（SKU）提取与融合
* Claude技能生成与格式化
* 路由器和术语表生成

### 安装与配置
1. 插件已集成到市场，可通过 `/plugin install pdf2skills@cong.claude-marketplace` 安装
2. 安装后运行 `/pdf2skills:setup` 配置Python环境和API密钥
3. API密钥配置：
   - SiliconFlow API：用于LLM处理（https://siliconflow.cn/）
   - MinerU API：用于PDF转Markdown（https://mineru.net/）
4. 配置存储在 `.claude/cong.claude-marketplace.local.md` 和插件目录的 `.env` 文件中

### 使用命令
* `/pdf2skills:setup` - 环境设置（Python依赖、spaCy模型、API配置）
* `/pdf2skills:convert <pdf文件>` - 转换PDF为Claude技能
   - 参数：`--output-dir` 输出目录，`--language` 语言（ch/en），`--resume` 恢复模式

### 输出结构
转换生成以下目录结构：
```
<输出目录>/
├── full.md                          # 提取的Markdown
├── full_chunks/                     # 分块文档
├── full_chunks_density/             # 语义分析
└── full_chunks_skus/                # 知识单元
    ├── skus/                        # 单个SKU文件
    ├── buckets.json                 # 分组SKU
    ├── router.json                  # 层次化路由
    ├── glossary.json                # 领域术语表
    └── generated_skills/            # Claude技能
        ├── index.md                 # 技能导航
        └── <技能名称>/SKILL.md      # 单个技能文件
```

### 使用原则
* 大型PDF文件（>100页）建议分块处理
* 转换过程可能需要较长时间（30+分钟）
* 使用 `--resume` 参数可从中断处恢复
* 生成的技能需要人工审核和优化
