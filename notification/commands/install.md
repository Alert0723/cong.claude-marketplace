---
description: Install or reinstall the click-to-activate handler (Windows/macOS/Linux)
allowed-tools: Bash, Read
---

# notification: Install Click-to-Activate Handler

Install the click-to-activate feature so clicking "打开会话" on a notification brings the correct terminal window to the front.

## Step 1: Detect platform

```bash
uname -s 2>/dev/null || echo "Windows"
```

- `Darwin` → macOS steps below
- `Linux` → Linux steps below
- `Windows` (or error) → Windows steps below

## Step 2: Check current status

**macOS:**
```bash
command -v terminal-notifier && terminal-notifier -version || echo "NOT INSTALLED"
```

**Linux:**
```bash
xdg-mime query default x-scheme-handler/claude 2>/dev/null || echo "NOT REGISTERED"
```

**Windows:**
```bash
reg query "HKCU\Software\Classes\claude\shell\open\command" 2>&1 && echo "REGISTERED" || echo "NOT REGISTERED"
```

If already configured, report status and ask the user whether to reinstall.

## Step 3: Run the install script

**macOS / Linux:**
```bash
bash "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/install-protocol-handler.sh"
```

**Windows:**
```bash
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/install-protocol-handler.ps1"
```

## Step 4: Verify

**macOS:**
```bash
command -v terminal-notifier && echo "OK" || echo "FAILED"
```

**Linux:**
```bash
cat ~/.local/share/applications/claude-protocol.desktop 2>/dev/null && \
  xdg-mime query default x-scheme-handler/claude
command -v wmctrl && echo "wmctrl: OK" || echo "wmctrl: not installed (sudo apt install wmctrl)"
command -v xdotool && echo "xdotool: OK" || echo "xdotool: not installed (sudo apt install xdotool)"
```

**Windows:**
```bash
reg query "HKCU\Software\Classes\claude\shell\open\command"
```

## Step 5: Report outcome

Tell the user:
- Whether the handler is now registered
- Platform-specific details (exe path / terminal-notifier version / desktop file path)
- That clicking "打开会话" on future notifications will bring the Claude terminal window to the front
