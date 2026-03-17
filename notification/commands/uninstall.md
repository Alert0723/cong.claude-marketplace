---
description: Uninstall notification - remove plugin files, protocol handlers, and hooks
allowed-tools: Bash, Read, Write, Edit
---

# Uninstall Notification

This command removes all notification configurations and files from your system.

## Step 1: Detect platform

```bash
uname -s 2>/dev/null || echo "Windows"
```

- `Darwin` → macOS steps below
- `Linux` → Linux steps below
- `Windows` (or error) → Windows steps below

## Step 2: Uninstall protocol handler

**macOS:**

Terminal-notifier is installed via Homebrew and can be left for other uses. If you want to remove it:

```bash
brew uninstall terminal-notifier
```

**Linux:**

Remove the desktop file and unregister the protocol:

```bash
# Remove desktop file
rm -f ~/.local/share/applications/claude-protocol.desktop

# Unregister the protocol handler
xdg-mime uninstall x-scheme-handler/claude 2>/dev/null

# Update desktop database
update-desktop-database ~/.local/share/applications 2>/dev/null
```

**Windows:**

Remove the registry entry:

```bash
# Remove registry key
reg delete "HKCU\Software\Classes\claude" /f 2>/dev/null
```

## Step 3: Uninstall the plugin

Run:
```
/plugin uninstall notification
```

This will remove the plugin files from `~/.claude/plugins/cache/`.

## Step 4: Verify cleanup

After uninstalling, verify:

1. Plugin no longer listed in installed plugins
2. Protocol handler removed

**macOS:**
```bash
# Check terminal-notifier (optional)
command -v terminal-notifier && echo "terminal-notifier still installed" || echo "terminal-notifier removed"
```

**Linux:**
```bash
# Check protocol handler
xdg-mime query default x-scheme-handler/claude 2>/dev/null || echo "Protocol handler removed"

# Check desktop file
ls -la ~/.local/share/applications/claude-protocol.desktop 2>/dev/null || echo "Desktop file removed"
```

**Windows:**
```bash
# Check registry
reg query "HKCU\Software\Classes\claude" 2>&1 | grep -q "ERROR" && echo "Registry key removed" || echo "Registry key still exists"
```

## Cleanup Complete

After these steps, notification is completely removed from your system.

**Note**: If you plan to reinstall in the future, simply run `/plugin install notification@cong.claude-marketplace` followed by `/notification:install`.
