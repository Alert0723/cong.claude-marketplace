---
name: lark-docs-operations
description: Feishu/Lark cloud docs and bitable operations knowledge. TRIGGER when: 用户提及"飞书文档"、"飞书云文档"、"lark docs"、"feishu docs"、"多维表格"、"飞书表格"、"bitable"、"lark bitable"、"create feishu document"、"update bitable records", or needs to create/edit/read Feishu document content.
version: 1.2.0
---

# Feishu Cloud Documents Operations Guide

Provides knowledge for operating Feishu cloud documents and bitables through MCP tools.

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
| Create | `lark_doc_create` | title, folder_token (optional) |
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

## Best Practices

1. **Preparation**: Configure MCP via `/lark-docs:install`, verify app permissions
2. **Batch Operations**: Process bitable records in batches of 50 max
3. **Security**: Never expose App Secret in logs, follow least privilege principle

## References

- [Block Types Reference](./references/block-types.md) - Complete block type mapping
- [Create Document Example](./references/create-document-example.md) - Full PowerShell example
- [Feishu Open Platform](https://open.feishu.cn/)
- [Feishu MCP Documentation](https://github.com/larksuite/lark-mcp)
