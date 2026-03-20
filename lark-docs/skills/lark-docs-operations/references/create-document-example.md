# Create Document Example (PowerShell)

Complete PowerShell script for creating a Feishu document with proper encoding and permissions.

## Prerequisites

- Feishu App ID and App Secret
- App has `docs:doc` and `drive:drive` permissions

## Full Script

```powershell
# Configuration
$AppId = "YOUR_APP_ID"
$AppSecret = "YOUR_APP_SECRET"

# 1. Get tenant_access_token
$tokenBody = @{ app_id = $AppId; app_secret = $AppSecret } | ConvertTo-Json
$tokenResp = Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" -Method Post -ContentType "application/json" -Body $tokenBody
$token = $tokenResp.tenant_access_token

# 2. Create document (UTF-8 without BOM)
$createJson = '{"title":"Test Document"}'
[System.IO.File]::WriteAllText("$env:TEMP\create.json", $createJson, [System.Text.UTF8Encoding]::new($false))
$docResp = curl -s -X POST "https://open.feishu.cn/open-apis/docx/v1/documents" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "@$env:TEMP\create.json" | ConvertFrom-Json
$docId = $docResp.data.document.document_id

# 3. Add content blocks
$blocksJson = @{
    children = @(
        @{ block_type = 3; heading1 = @{ elements = @(@{ text_run = @{ content = "Welcome" } }) } },
        @{ block_type = 2; text = @{ elements = @(@{ text_run = @{ content = "This is a test document" } }) } },
        @{ block_type = 12; bullet = @{ elements = @(@{ text_run = @{ content = "Item 1" } }) } },
        @{ block_type = 12; bullet = @{ elements = @(@{ text_run = @{ content = "Item 2" } }) } }
    )
} | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("$env:TEMP\blocks.json", $blocksJson, [System.Text.UTF8Encoding]::new($false))
curl -s -X POST "https://open.feishu.cn/open-apis/docx/v1/documents/$docId/blocks/$docId/children/batch_create" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "@$env:TEMP\blocks.json"

# 4. Set permissions (REQUIRED - otherwise link shows "page not found")
$permJson = '{"external_access":true,"link_share_entity":"tenant_readable","security_entity":"anyone_can_view"}'
[System.IO.File]::WriteAllText("$env:TEMP\perm.json", $permJson, [System.Text.UTF8Encoding]::new($false))
curl -s -X PUT "https://open.feishu.cn/open-apis/drive/v1/permissions/$docId/public?type=docx" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d "@$env:TEMP\perm.json"

# 5. Output document link
Write-Host "Document URL: https://feishu.cn/docx/$docId"
```

## Key Points

1. **Encoding**: Use `[System.IO.File]::WriteAllText` with UTF-8 no BOM encoding
2. **Permissions**: MUST call permissions API after creating document
3. **Token**: Use tenant_access_token for app-level operations
4. **Cleanup**: Temporary JSON files are created in `$env:TEMP`

## Error Handling

Check API response `code` field:
- `code: 0` = Success
- `code: 非0` = Error, check `msg` field
