---
description: 配置飞书 MCP 服务器，连接飞书云文档
allowed-tools: Bash, AskUserQuestion
---

# 配置飞书 MCP

引导用户配置飞书开放平台的 MCP 服务器连接。

## 执行步骤

1. **检查前置条件**
   - 运行 `claude mcp list` 检查 lark-office-mcp 是否已存在
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
   > - lark-office-mcp 只能访问你指定的文件夹
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
   首先克隆 lark-office-mcp 仓库：
   ```bash
   cd ~/.claude && git clone https://github.com/YSzEthan/lark-office-mcp.git
   ```

   然后安装依赖并配置 MCP 服务器：
   ```bash
   # 安装 Bun（如果未安装）
   # Windows: powershell -c "irm bun.sh/install.ps1 | iex"
   # macOS/Linux: curl -fsSL https://bun.sh/install | bash

   # 安装依赖
   cd ~/.claude/lark-office-mcp && bun install

   # 添加 MCP 服务器（Windows）
   claude mcp add-json --scope=user lark-office-mcp '{
     "command": "bun",
     "args": [
       "run",
       "<HOME>/.claude/lark-office-mcp/src/index.ts"
     ],
     "env": {
       "LARK_APP_ID": "<App_ID>",
       "LARK_APP_SECRET": "<App_Secret>",
       "LARK_CALLBACK_PORT": "9876",
       "LARK_FOLDER_TOKEN": "<Folder_Token>"
     }
   }'

   # macOS/Linux 用户将 <HOME> 替换为 $HOME 或完整路径
   # Windows 用户将 <HOME> 替换为 C:\\Users\\<用户名> 或 %USERPROFILE%
   ```

   将 `<App_ID>`、`<App_Secret>` 和 `<Folder_Token>` 替换为用户输入的值。

5. **启用 MCP 服务器**
   确保在 settings.json 中启用:
   ```json
   {
     "enabledMcpjsonServers": ["lark-office-mcp"]
   }
   ```

6. **验证配置**
   - 运行 `claude mcp list` 确认 lark-office-mcp 已添加
   - 告知用户配置成功

7. **后续指引**
   告知用户：
   - 需要重启 Claude Code 会话才能加载新的 MCP 服务器
   - 可以使用 `/mcp` 查看 MCP 工具
   - 现在可以通过自然语言操作飞书文档了
   - 所有创建的文档将保存在指定的文件夹中（使用 doc_create 工具时传入 folder_token）
   - 文档所有者为登录的用户（通过 OAuth 授权）
   - 建议确认应用已开通相关权限

## 错误处理

- 如果 bun 命令失败，提示用户检查 Bun 是否安装
- 如果 MCP 添加失败，提示用户检查凭证是否正确
- 如果 FolderToken 格式错误，提示用户重新从 URL 中提取

## 押注说明

- **重要**: 官方 `@larksuiteoapi/lark-mcp` 的 `docx_builtin_import` 不支持 `folder_token` 参数
- 本插件使用第三方 `lark-office-mcp` (https://github.com/YSzEthan/lark-office-mcp) 实现
- `lark-office-mcp` 的 `doc_create` 工具支持 `folder_token` 参数，可以指定文档创建位置
