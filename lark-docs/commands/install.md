---
description: 配置飞书 MCP 服务器，连接飞书云文档
allowed-tools: Bash, AskUserQuestion
---

# 配置飞书 MCP

引导用户配置飞书开放平台的 MCP 服务器连接。

## 执行步骤

1. **检查前置条件**
   - 运行 `claude mcp list` 检查 lark-mcp 是否已存在
   - 如果已存在，询问用户是否要重新配置

2. **获取凭证**
   使用 AskUserQuestion 询问用户：
   - App_ID: 飞书开放平台应用的 App ID
   - App_Secret: 飞书开放平台应用的 App Secret

   提示用户：
   > 请前往 [飞书开放平台](https://open.feishu.cn/) → 我的应用 → 凭证与基础信息 获取

3. **配置 MCP**
   执行以下命令添加 MCP 服务器：

   ```bash
   claude mcp add-json --scope=user lark-mcp '{
     "command": "npx",
     "args": [
       "-y",
       "@larksuiteoapi/lark-mcp",
       "mcp",
       "-a", "<App_ID>",
       "-s", "<App_Secret>",
       "--oauth"
     ]
   }'
   ```

   将 `<App_ID>` 和 `<App_Secret>` 替换为用户输入的值。

4. **验证配置**
   - 运行 `claude mcp list` 确认 lark-mcp 已添加
   - 告知用户配置成功

5. **后续指引**
   告知用户：
   - 可以使用 `/mcp` 查看 MCP 工具
   - 现在可以通过自然语言操作飞书文档了
   - 建议确认应用已开通相关权限

## 错误处理

- 如果 npx 命令失败，提示用户检查 Node.js 是否安装
- 如果 MCP 添加失败，提示用户检查凭证是否正确
