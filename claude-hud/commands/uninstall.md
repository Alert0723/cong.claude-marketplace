---
description: Uninstall claude-hud - remove statusline config and plugin files
allowed-tools: Read, Write, Edit, Bash
---

# Uninstall Claude HUD

This command removes all claude-hud configurations and files from your system.

## Step 1: Remove statusline configuration

Read the settings file:
- **macOS/Linux**: `~/.claude/settings.json`
- **Windows**: `$env:USERPROFILE\.claude\settings.json`

If the file exists and contains a `statusLine` entry, remove it entirely.

**Important**: Only remove the `statusLine` key, preserve all other settings (hooks, commands, MCPs, etc.).

Example:
```json
// Before
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile..."
  },
  "mcpServers": { ... }
}

// After
{
  "mcpServers": { ... }
}
```

If `statusLine` is the only key in the file, the resulting file should be an empty object `{}` or delete the file entirely (after checking with user).

## Step 2: Remove user configuration

Delete the claude-hud config file if it exists:
- **macOS/Linux**: `~/.claude/plugins/claude-hud/config.json`
- **Windows**: `$env:USERPROFILE\.claude\plugins\claude-hud\config.json`

## Step 3: Uninstall the plugin

Run:
```
/plugin uninstall claude-hud
```

This will remove the plugin files from `~/.claude/plugins/cache/`.

## Step 4: Verify cleanup

After uninstalling, verify:

1. Settings file no longer has `statusLine` key
2. Config directory removed (if it was the only thing there)
3. Plugin no longer listed in installed plugins

**On Windows (PowerShell)**:
```powershell
# Check settings
Get-Content "$env:USERPROFILE\.claude\settings.json" | Select-String "statusLine"

# Check config dir (should not exist or be empty)
Test-Path "$env:USERPROFILE\.claude\plugins\claude-hud"
```

**On macOS/Linux**:
```bash
# Check settings
grep -q "statusLine" ~/.claude/settings.json && echo "Found" || echo "Not found"

# Check config dir
ls -la ~/.claude/plugins/claude-hud/ 2>/dev/null || echo "Directory removed"
```

## Cleanup Complete

After these steps, claude-hud is completely removed from your system. The statusline will revert to Claude Code's default behavior.

**Note**: If you plan to reinstall in the future, simply run `/plugin install claude-hud` followed by `/claude-hud:setup`.
