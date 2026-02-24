---
name: knowledge
description: |
  This skill should be used when the user asks about the knowledge system,
  wants to learn knowledge, search knowledge, or manage the knowledge base.
  Use when the user mentions "knowledge", "learn", "记忆", or asks for project
  context that might be in the knowledge base.
---

# Knowledge System

The Knowledge System provides cross-session memory and on-demand knowledge retrieval.

## When to invoke

- User asks to "learn knowledge" or "学习知识"
- User searches for "something from previous sessions"
- User asks "what do you know about this project?"
- User mentions "记忆" (memory) related to code understanding
- User needs context for project-specific code/APIs

## Knowledge retrieval workflow

When the user asks a question that might be answered from knowledge:

### 1. Check if knowledge exists

Search both user-level and project-level knowledge bases for relevant knowledge matching the user's query.

### 2. Inject relevant knowledge

If relevant knowledge is found, inject it into the conversation context:
```
[相关知识]

🟦 用户级知识: <summary>
🟩 项目级知识: <summary>

---
```

### 3. Answer based on knowledge

Use the injected knowledge to provide a more informed response.

**Important:** Only retrieve knowledge when the user explicitly asks or when the query clearly indicates a need for project-specific information.

## User commands

- `/knowledge` - View and learn pending knowledge
- `/knowledge:setup` - First-time configuration
- `/knowledge:search <query>` - Search knowledge base
- `/knowledge:pending` - View pending queue
- `/knowledge:status` - View knowledge statistics

## Storage locations

- User-level: `~/.claude/knowledge/`
- Project-level: `.claude/knowledge/`

## Knowledge classification

- **User-level**: Cross-project patterns, coding standards, personal preferences
- **Project-level**: API design, architecture decisions, business logic
