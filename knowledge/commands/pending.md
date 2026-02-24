---
name: knowledge:pending
description: |
  This command shows the pending queue of knowledge items that haven't been
  classified or learned yet.
---

# Pending Knowledge Queue

View and manage the pending knowledge queue.

## Process

### 1. Load pending queue

Load the pending queue from the plugin configuration directory.

### 2. Display pending items

Display items in the pending queue:
```
⏳ 待定队列 (共 N 条)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 [重要度: 0.7] src/components/Button.tsx
   └─ 添加时间: 2026-02-25 14:30
   └─ 状态: pending

   [学习] [用户级] [项目级] [删除]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Handle empty queue

If the pending queue is empty, display:
```
✓ 待定队列为空
```

### 4. Process user action

For each item in the pending queue, use `AskUserQuestion` to get the user's action:

Options:
- "学习" - Learn now
- "用户级" - Learn as user-level knowledge
- "项目级" - Learn as project-level knowledge
- "删除" - Remove from queue
