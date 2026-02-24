---
name: knowledge
description: |
  This command manages the knowledge index system - viewing pending knowledge,
  classifying by user/project level, and learning knowledge into the database.
---

# Knowledge Management

Use this command to manage the selective knowledge index system.

## When to use

- User types `/knowledge`
- User wants to see pending knowledge to learn
- User wants to classify or learn knowledge

## Process

### 1. Check configuration

First, check if the plugin is configured. Read the config file to verify setup is complete.

If configuration doesn't exist or is incomplete, guide the user to run `/knowledge:setup` first.

### 2. Detect changes

Run the change detector to find modified, added, or deleted files in the current project.

If no changes are detected, display a message indicating no new changes and exit.

### 3. Analyze and display knowledge

For each detected change:
1. Analyze importance (0.0 - 1.0 scale)
2. Determine knowledge level (user-level or project-level)
3. Generate a summary

Display format:
```
📋 待学习知识 (共 N 条)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 [重要度: 0.9] src/api/auth.ts
   └─ 变更类型: 新增功能
   └─ 说明: 实现JWT认证，包含登录/刷新/登出

   [学习] [用户级] [项目级] [跳过]
```

### 4. Check for similar knowledge

For each new knowledge item, check for similar existing knowledge in both user-level and project-level knowledge bases.

If similar knowledge is found (same file path or content similarity > 0.5), display a warning and offer merge options:
```
⚠️  检测到相似知识

🔴 [重要度: 0.9] src/api/auth.ts (新)
   └─ 变更类型: 新增功能
   └─ 说明: 实现JWT认证，包含登录/刷新/登出

   与以下知识相似：

   🟡 [重要度: 0.7] src/api/auth.ts (已存在)
      └─ 说明: 基础API结构定义
      └─ 更新时间: 2天前

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   [新建知识] [合并到现有] [跳过] [查看差异]
```

### 5. Get user action

For each knowledge item, use `AskUserQuestion` to get the user's choice:

Options:
- "学习" - Learn as project-level knowledge
- "用户级" - Learn as user-level knowledge
- "跳过" - Skip this knowledge (mark as skipped in pending queue)
- "查看差异" - Show diff with similar knowledge (if applicable)

### 6. Process user action

Based on user's choice:
- **Learn**: Save knowledge to appropriate storage (user-level or project-level)
- **Skip**: Mark as skipped in pending queue
- **Merge**: Update existing knowledge with new content, preserving version history

### 7. Confirm completion

After processing all items, display a summary:
```
✓ 完成！已处理 N 条知识
  - 学习: X 条
  - 跳过: Y 条
  - 合并: Z 条
```
