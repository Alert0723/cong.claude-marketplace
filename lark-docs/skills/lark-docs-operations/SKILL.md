---
name: lark-docs-operations
description: 飞书云文档和多维表格操作知识。TRIGGER when: 用户提及"飞书文档"、"飞书云文档"、"lark docs"、"feishu docs"、"多维表格"、"飞书表格"、"bitable"、"lark bitable"，或需要创建/编辑/读取飞书文档内容。
version: 1.0.0
---

# 飞书云文档操作指南

为 Claude 提供飞书云文档和多维表格的操作知识，确保通过 MCP 工具正确操作飞书文档。

## 核心概念

### 飞书文档类型

1. **云文档 (Doc)** - 富文本文档，支持标题、列表、表格、图片等
2. **多维表格 (Bitable)** - 类似数据库的表格，支持视图、筛选、分组
3. **电子表格 (Sheet)** - 传统电子表格，类似 Excel
4. **知识库 (Wiki)** - 文档集合，支持目录结构

### MCP 工具命名规范

飞书 MCP 工具通常遵循以下命名：
- `lark_*` - 飞书相关操作
- `*_doc_*` - 云文档操作
- `*_bitable_*` - 多维表格操作
- `*_sheet_*` - 电子表格操作

## 常用操作

### 1. 云文档操作

#### 创建文档
```
使用 lark_doc_create 工具
参数: title (标题), folder_token (可选，指定文件夹)
返回: document_id, url
```

#### 读取文档内容
```
使用 lark_doc_read 或 lark_doc_get_content 工具
参数: document_id
返回: 文档结构和内容
```

#### 编辑文档
```
使用 lark_doc_update 或 lark_doc_patch_content 工具
参数: document_id, content/operations
```

### 2. 多维表格操作

#### 获取表格信息
```
使用 lark_bitable_get 或 lark_bitable_list_tables 工具
参数: app_token
返回: 表格结构、字段定义
```

#### 读取记录
```
使用 lark_bitable_list_records 工具
参数: app_token, table_id, view_id (可选)
返回: 记录列表
```

#### 创建记录
```
使用 lark_bitable_create_record 工具
参数: app_token, table_id, fields (字段值对象)
```

#### 更新记录
```
使用 lark_bitable_update_record 工具
参数: app_token, table_id, record_id, fields
```

#### 删除记录
```
使用 lark_bitable_delete_record 工具
参数: app_token, table_id, record_id
```

### 3. 字段类型对照

| 字段类型 | 英文名 | 值格式 |
|---------|--------|--------|
| 文本 | text | "字符串" |
| 数字 | number | 123 |
| 单选 | singleSelect | "选项名" |
| 多选 | multiSelect | ["选项1", "选项2"] |
| 日期 | date | 时间戳毫秒 |
| 人员 | user | [{ "id": "ou_xxx" }] |
| 附件 | attachment | [{ "file_token": "xxx" }] |
| 链接 | link | { "link": "url", "text": "显示文本" } |
| 复选框 | checkbox | true/false |

## 最佳实践

### 1. 操作前准备
- 确认已通过 `/lark-docs:install` 配置 MCP
- 确认飞书应用已开通对应权限
- 获取必要的 token (app_token, document_id 等)

### 2. 错误处理
- 权限错误：检查飞书应用权限配置
- Token 错误：确认 token 是否正确且有效
- 限流：飞书 API 有调用频率限制，需要适当等待

### 3. 批量操作
- 多维表格批量创建记录时，分批处理避免超时
- 大量数据更新时，考虑使用异步方式

### 4. 安全注意
- 不要在日志中暴露 App Secret
- 敏感数据注意脱敏处理
- 遵循最小权限原则配置应用权限

## 常见问题

### Q: 如何获取 app_token？
A: app_token 在飞书文档 URL 中可以找到，格式为：
- 多维表格: `https://xxx.feishu.cn/base/<app_token>`
- 云文档: `https://xxx.feishu.cn/docx/<document_id>`

### Q: 如何获取用户 Open ID？
A: 可以通过飞书通讯录 API 获取，或在多维表格的人员字段中查看

### Q: 权限不足怎么办？
A: 前往飞书开放平台 → 应用 → 权限管理，开通所需权限并重新发布应用

## 参考链接

- [飞书开放平台](https://open.feishu.cn/)
- [飞书 MCP 文档](https://github.com/larksuite/lark-mcp)
- [多维表格 API 文档](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview)
