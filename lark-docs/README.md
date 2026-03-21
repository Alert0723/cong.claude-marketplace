# lark-docs - 飞书云文档联动插件

通过飞书 MCP 实现 Claude Code 对云文档和多维表格的自主操作。

## 功能特性

- 🚀 一键配置飞书 MCP 服务器
- 📄 支持云文档的创建、读取、编辑
- 📊 支持多维表格的操作
- 🤖 智能识别飞书文档相关需求并自动执行
- 🔐 权限安全设计：限制操作范围到指定文件夹
- 👤 文档所有者为登录用户（通过 OAuth），而非机器人

## 安装

```bash
/plugin lark-docs
```

## 使用

### 配置飞书 MCP

```bash
/lark-docs:install
```

按提示输入以下信息：
1. **App_ID** 和 **App_Secret**：飞书开放平台应用凭证
2. **FolderToken**：指定操作范围的文件夹 Token

### 查看配置状态

```bash
/lark-docs:status
```

### 移除配置

```bash
/lark-docs:uninstall
```

## 前置要求

1. 飞书开放平台账号
2. 已创建飞书应用并获取 App_ID 和 App_Secret
3. 应用已开通文档/多维表格相关权限
4. 准备好用于存储 AI 生成文档的文件夹

## 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 在「凭证与基础信息」页面获取 App ID 和 App Secret
4. 在「权限管理」中开通所需权限（如 `docs:doc`, `bitable:record` 等）

## 获取 FolderToken

### 为什么需要 FolderToken?

这是权限安全设计:
- lark-docx 只能访问你指定的文件夹
- 不会影响其他飞书文档
- 你完全控制工具的操作范围
- 生成的文档所有者属于登录的用户而非机器人

### 如何获取?

1. 打开飞书 → "我的空间"(云盘)
2. 创建一个文件夹（如 "AI-Documents"）
3. 进入文件夹，复制浏览器地址栏的 URL
4. URL 格式：`https://xxx.feishu.cn/drive/folder/<folder_token>`
5. 提取其中的 `<folder_token>` 部分

## 组件

- **Commands**: `install`, `status`, `uninstall`
- **Skill**: `lark-docs-operations` - 飞书文档操作知识
- **Agent**: `lark-docs-agent` - 自主处理飞书文档任务
