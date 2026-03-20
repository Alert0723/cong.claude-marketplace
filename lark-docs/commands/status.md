---
description: 查看飞书 MCP 配置状态
allowed-tools: Bash
---

# 查看飞书 MCP 状态

检查 lark-mcp 的配置状态和连接情况。

## 执行步骤

1. **检查 MCP 配置**
   运行以下命令：
   ```bash
   claude mcp list
   ```

2. **分析结果**
   - 查找 `lark-mcp` 是否存在于列表中
   - 如果存在，显示配置信息
   - 如果不存在，提示用户运行 `/lark-docs:install`

3. **输出状态报告**

   **已配置时显示：**
   ```
   ✅ 飞书 MCP 已配置

   服务器名称: lark-mcp
   命令: npx -y @larksuiteoapi/lark-mcp mcp
   参数: --oauth (OAuth 模式)

   可用工具: (运行 /mcp 查看详细工具列表)
   ```

   **未配置时显示：**
   ```
   ❌ 飞书 MCP 未配置

   请运行 /lark-docs:install 进行配置
   ```

4. **可选：测试连接**
   如果配置存在，可以运行 `/mcp` 查看可用的飞书工具列表。
