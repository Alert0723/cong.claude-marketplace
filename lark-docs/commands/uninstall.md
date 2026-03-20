---
name: uninstall
description: 移除飞书 MCP 配置
argument-hint: 无参数
allowed-tools:
  - Bash
  - AskUserQuestion
---

# 移除飞书 MCP 配置

从 Claude Code 中移除 lark-mcp 服务器配置。

## 执行步骤

1. **检查当前状态**
   运行 `claude mcp list` 检查 lark-mcp 是否存在

2. **确认操作**
   使用 AskUserQuestion 确认用户是否要移除配置：
   > 确定要移除飞书 MCP 配置吗？移除后将无法通过 Claude 操作飞书文档。

3. **移除配置**
   如果用户确认，执行：
   ```bash
   claude mcp remove --scope=user lark-mcp
   ```

4. **验证移除**
   - 运行 `claude mcp list` 确认 lark-mcp 已移除
   - 告知用户配置已移除

5. **后续说明**
   告知用户：
   - 如需重新配置，可运行 `/lark-docs:install`
   - 飞书开放平台的应用配置不会被删除

## 错误处理

- 如果 lark-mcp 不存在，提示用户无需移除
- 如果移除失败，提示用户手动编辑配置文件
