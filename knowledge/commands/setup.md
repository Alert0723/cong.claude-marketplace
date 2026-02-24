---
name: knowledge:setup
description: |
  This command handles first-time plugin configuration, prompting the user for
  storage paths and behavioral preferences.
---

# Knowledge Plugin Setup

First-time configuration for the knowledge index plugin.

## Process

### 1. Check if already configured

First, read the config file to check if it already exists and is not empty.

If config exists and contains values, display the current configuration:
```
当前配置:
- 自动启动: <value>
- 学习前确认: <value>
- 用户知识目录: <value>
- 项目知识目录: <value>

是否修改配置？
```

### 2. Prompt for auto-start

If config doesn't exist or user chooses to modify, prompt for auto-start preference:

Use `AskUserQuestion`:
- Question: "是否在启动新对话时自动运行知识检测？"
- Options: "是，自动检测" / "否，手动触发"

### 3. Prompt for confirmation

Prompt for confirmation preference:

Use `AskUserQuestion`:
- Question: "学习知识前是否需要确认？"
- Options: "是，每次确认" / "否，自动学习"

### 4. Save configuration

Write the configuration to `${CLAUDE_PLUGIN_ROOT}/config.json`:

```json
{
  "autoStart": <value>,
  "confirmBeforeLearn": <value>,
  "userKnowledgeDir": "~/.claude/knowledge",
  "projectKnowledgeDir": ".claude/knowledge"
}
```

### 5. Create directories

Create the knowledge directories if they don't exist:
- User-level: `~/.claude/knowledge/`
- Project-level: `.claude/knowledge/`

### 6. Confirm completion

Display success message:
```
✓ 配置完成！

配置已保存到: ${CLAUDE_PLUGIN_ROOT}/config.json

知识目录:
- 用户级: ~/.claude/knowledge/
- 项目级: .claude/knowledge/

现在可以使用 /knowledge 命令开始学习知识了。
```
