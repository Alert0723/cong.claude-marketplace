# lark-docs - 飞书云文档联动插件

通过飞书 MCP 实现 Claude Code 对云文档和多维表格的自主操作。

## 功能特性

- 🚀 一键配置飞书 MCP 服务器
- 📄 支持云文档的创建、读取、编辑
- 📊 支持多维表格的操作
- 🤖 智能识别飞书文档相关需求并自动执行

## 安装

```bash
/plugin lark-docs
```

## 使用

### 配置飞书 MCP

```bash
/lark-docs:install
```

按提示输入飞书开放平台的 App_ID 和 App_Secret。

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

## 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 在「凭证与基础信息」页面获取 App ID 和 App Secret
4. 在「权限管理」中开通所需权限（如 `docs:doc`, `bitable:record` 等）

## 组件

- **Commands**: `install`, `status`, `uninstall`
- **Skill**: `lark-docs-operations` - 飞书文档操作知识
- **Agent**: `lark-docs-agent` - 自主处理飞书文档任务
