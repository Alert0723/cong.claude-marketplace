---
name: knowledge:search
description: |
  This command searches the knowledge base for relevant information based on
  the user's query. Supports keyword and semantic search.
---

# Knowledge Search

Search the knowledge base for relevant information.

## Parameters

- `query`: Search query (required)

## Process

### 1. Parse query

Extract the search query from the command arguments.

### 2. Search both knowledge bases

Search in both user-level and project-level knowledge bases:
- User-level: `~/.claude/knowledge/`
- Project-level: `.claude/knowledge/`

For each knowledge base, run the search function to find matching items.

### 3. Merge and rank results

Combine results from both knowledge bases and sort by importance (descending).

### 4. Display results

Display search results:
```
🔍 搜索结果: "<query>"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟦 [用户级] API认证规范
   └─ 重要度: 0.9
   └─ 文件: src/api/auth.ts
   └─ 说明: JWT认证实现，包含登录/刷新/登出

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟩 [项目级] 数据库配置
   └─ 重要度: 0.6
   └─ 文件: config/database.json
   └─ 说明: PostgreSQL连接配置

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Handle no results

If no matching knowledge is found, display:
```
未找到相关知识。使用 /knowledge 命令学习新知识。
```
