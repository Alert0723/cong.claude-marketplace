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

2. **获取应用凭证**
   使用 AskUserQuestion 询问用户：
   - App_ID: 飞书开放平台应用的 App ID
   - App_Secret: 飞书开放平台应用的 App Secret

   提示用户：
   > 请前往 [飞书开放平台](https://open.feishu.cn/) → 我的应用 → 凭证与基础信息 获取

3. **获取文件夹 Token（必须）**
   使用 AskUserQuestion 询问用户 FolderToken：

   **获取步骤指导**：
   > **为什么需要 FolderToken?**
   > 这是权限安全设计:
   > - lark-docx 只能访问你指定的文件夹
   > - 不会影响其他飞书文档
   > - 你完全控制工具的操作范围
   > - 生成的文档所有者属于登录的用户而非机器人
   >
   > **如何获取?**
   > 1. 打开飞书 → "我的空间"(云盘)
   > 2. 创建一个文件夹（如 "AI-Documents"）
   > 3. 进入文件夹，复制浏览器地址栏的 URL
   > 4. URL 格式：`https://xxx.feishu.cn/drive/folder/<folder_token>`
   > 5. 提取其中的 `<folder_token>` 部分

4. **配置 MCP**
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
       "--folder-token", "<Folder_Token>",
       "--oauth"
     ]
   }'
   ```

   将 `<App_ID>`、`<App_Secret>` 和 `<Folder_Token>` 替换为用户输入的值。

5. **验证配置**
   - 运行 `claude mcp list` 确认 lark-mcp 已添加
   - 告知用户配置成功

6. **后续指引**
   告知用户：
   - 可以使用 `/mcp` 查看 MCP 工具
   - 现在可以通过自然语言操作飞书文档了
   - 所有创建的文档将保存在指定的文件夹中
   - 文档所有者为登录的用户（通过 OAuth 授权）
   - 建议确认应用已开通相关权限

## 错误处理

- 如果 npx 命令失败，提示用户检查 Node.js 是否安装
- 如果 MCP 添加失败，提示用户检查凭证是否正确
- 如果 FolderToken 格式错误，提示用户重新从 URL 中提取
