---
name: knowledge:status
description: |
  This command shows statistics about the knowledge base - total knowledge,
  pending items, storage usage, etc.
---

# Knowledge Status

Display knowledge base statistics and status.

## Process

### 1. Load statistics

Count and calculate statistics:
- User-level knowledge count
- Project-level knowledge count
- Pending items count
- Storage sizes (using du command)

### 2. Display status

Display the statistics:
```
📊 知识库状态

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用户级知识:
  - 总数: <count> 条
  - 存储: <size>

项目级知识:
  - 总数: <count> 条
  - 存储: <size>

待定队列:
  - 待处理: <count> 条

最近学习:
  - 文件: <filename>
  - 时间: <timestamp>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
