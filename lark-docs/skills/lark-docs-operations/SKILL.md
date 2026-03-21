---
name: lark-docs-operations
description: Feishu/Lark cloud docs and bitable operations knowledge. TRIGGER when: 用户提及"飞书文档"、"飞书云文档"、"lark docs"、"feishu docs"、"多维表格"、"飞书表格"、"bitable"、"lark bitable"、"create feishu document"、"update bitable records", or needs to create/edit/read Feishu document content.
version: 1.3.0
---

# Feishu Cloud Documents Operations Guide

Provides knowledge for operating Feishu cloud documents and bitables through MCP tools.

## Folder Token（必须配置）

### 为什么需要 FolderToken?

这是权限安全设计:
- lark-docx 只能访问你指定的文件夹
- 不会影响其他飞书文档
- 你完全控制工具的操作范围
- 生成的文档所有者属于登录的用户（通过 OAuth）而非机器人

### 如何获取 FolderToken?

1. 打开飞书 → "我的空间"(云盘)
2. 创建一个文件夹（如 "AI-Documents"）
3. 进入文件夹，复制浏览器地址栏的 URL
4. URL 格式：`https://xxx.feishu.cn/drive/folder/<folder_token>`
5. 提取其中的 `<folder_token>` 部分

### 配置方式

在运行 `/lark-docs:install` 时输入 FolderToken，或手动配置 MCP：

```json
{
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
}
```

## Windows Encoding (Critical)

When using curl to send Chinese JSON on Windows, MUST write to UTF-8 without BOM file:

```powershell
$json = '{"title":"Chinese Title"}'
[System.IO.File]::WriteAllText('temp.json', $json, [System.Text.UTF8Encoding]::new($false))
curl -d @temp.json ...
```

**NEVER pass Chinese JSON directly in command line - causes encoding issues!**

## Document Permissions (Required After Creation)

Must set permissions after creating document, otherwise link shows "page not found":

```powershell
$permJson = '{"external_access":true,"link_share_entity":"tenant_readable","security_entity":"anyone_can_view"}'
[System.IO.File]::WriteAllText('perm.json', $permJson, [System.Text.UTF8Encoding]::new($false))
curl -X PUT "https://open.feishu.cn/open-apis/drive/v1/permissions/$docId/public?type=docx" `
  -H "Authorization: Bearer $token" -d @perm.json
```

## Core Concepts

### Document Types

1. **Doc** - Rich text document with headings, lists, tables, images
2. **Bitable** - Database-like table with views, filters, grouping
3. **Sheet** - Traditional spreadsheet, similar to Excel
4. **Wiki** - Document collection with directory structure

### MCP Tool Naming

- `lark_*` - Feishu related operations
- `*_doc_*` - Cloud document operations
- `*_bitable_*` - Bitable operations
- `*_sheet_*` - Spreadsheet operations

## Common Block Types

| block_type | Type | block_type | Type |
|------------|------|------------|------|
| 2 | Text | 12 | Bullet |
| 3 | Heading1 | 13 | Ordered |
| 4 | Heading2 | 14 | Code |
| 5 | Heading3 | 15 | Quote |
| 22 | Divider | 27 | Image |
| 31 | Table | 24/25 | Grid |

> See [references/block-types.md](./references/block-types.md) for complete list.

## Operations

### Document Operations

| Operation | Tool | Parameters |
|-----------|------|------------|
| Create | `lark_doc_create` | title, folder_token (可选，已在 MCP 配置中设置) |
| Read | `lark_doc_read` | document_id |
| Update | `lark_doc_update` | document_id, content |

### Bitable Operations

| Operation | Tool | Parameters |
|-----------|------|------------|
| Get info | `lark_bitable_get` | app_token |
| List records | `lark_bitable_list_records` | app_token, table_id |
| Create record | `lark_bitable_create_record` | app_token, table_id, fields |
| Update record | `lark_bitable_update_record` | app_token, table_id, record_id, fields |
| Delete record | `lark_bitable_delete_record` | app_token, table_id, record_id |

## Field Types

| Type | Format | Example |
|------|--------|---------|
| text | `"string"` | `"Hello"` |
| number | `123` | `100` |
| singleSelect | `"option"` | `"In Progress"` |
| multiSelect | `["opt1", "opt2"]` | `["A", "B"]` |
| date | timestamp (ms) | `1710960000000` |
| user | `[{"id": "ou_xxx"}]` | `[{"id": "ou_abc"}]` |
| checkbox | `true/false` | `true` |

## Token Extraction

From URL:
- Bitable: `https://xxx.feishu.cn/base/<app_token>`
- Doc: `https://xxx.feishu.cn/docx/<document_id>`
- Folder: `https://xxx.feishu.cn/drive/folder/<folder_token>`

## Best Practices

1. **Preparation**: Configure MCP via `/lark-docs:install` with FolderToken, verify app permissions
2. **Batch Operations**: Process bitable records in batches of 50 max
3. **Security**: Never expose App Secret in logs, follow least privilege principle
4. **Ownership**: Documents created via OAuth will be owned by the logged-in user

## References

- [Block Types Reference](./references/block-types.md) - Complete block type mapping
- [Create Document Example](./references/create-document-example.md) - Full PowerShell example
- [Feishu Open Platform](https://open.feishu.cn/)
- [Feishu MCP Documentation](https://github.com/larksuite/lark-mcp)
