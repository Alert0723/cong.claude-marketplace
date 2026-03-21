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
   - 检查是否包含 `--folder-token` 参数
   - 检查是否包含 `--oauth` 参数
   - 如果存在，显示配置信息
   - 如果不存在，提示用户运行 `/lark-docs:install`

3. **输出状态报告**

   **已配置时显示：**
   ```
   ✅ 飞书 MCP 已配置

   服务器名称: lark-mcp
   命令: npx -y @larksuiteoapi/lark-mcp mcp

   配置参数:
   - OAuth 模式: ✅ 已启用（文档所有者为登录用户）
   - Folder Token: ✅ 已配置（限制操作范围到指定文件夹）

   可用工具: (运行 /mcp 查看详细工具列表)

   📝 说明:
   - 所有创建的文档将保存在配置的文件夹中
   - 文档所有者为通过 OAuth 授权的用户
   ```

   **未配置时显示：**
   ```
   ❌ 飞书 MCP 未配置

   请运行 /lark-docs:install 进行配置
   ```

   **配置不完整时显示：**
   ```
   ⚠️ 飞书 MCP 配置不完整

   缺少以下配置:
   - Folder Token: ❌ 未配置（请重新运行 /lark-docs:install）

   建议重新运行 /lark-docs:install 以完成配置
   ```

4. **可选：测试连接**
   如果配置存在，可以运行 `/mcp` 查看可用的飞书工具列表。
