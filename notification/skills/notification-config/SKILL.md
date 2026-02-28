---
name: notification-config
description: |
  This skill should be used when the user asks to "configure notifications", "set up Bark",
  "configure Bark push", "change notification duration", "make notifications persistent",
  or mentions "Bark", "notification settings", "push notifications".
  Also use when AI needs to proactively send notifications after completing important tasks.
---

# Claude Notification Configuration and Usage

This plugin supports configuration and proactive notification sending on Windows, macOS, and Linux.

## Configuration File

**Location**: `.claude/cong.claude-marketplace.local.md` (project root)

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bark_url` | string | empty | Bark push URL, e.g., `https://api.day.app/your-key` |
| `bark_only` | boolean | false | Set to true to use only Bark, skip system notifications |
| `timeout` | number | 3000 | Notification display duration (ms), Linux only |
| `always_notify` | boolean | false | Set to true to always notify, even when terminal is in foreground |

### Configuration Template

```markdown
---
bark_url: ""
bark_only: false
timeout: 3000
always_notify: false
---
```

## Proactive Notification Sending

AI can call notification scripts at appropriate times.

### Available Scripts

Scripts are located in the `scripts/` directory of this skill:

| Script | Platform | Purpose |
|--------|----------|---------|
| `notify.sh` | macOS / Linux | System notification |
| `notify.ps1` | Windows | System notification |
| `bark.sh` | macOS / Linux | Bark push (full params) |
| `bark.ps1` | Windows | Bark push (full params) |
| `activate.sh` | macOS / Linux | Bring terminal window to front |
| `install-protocol-handler.sh` | macOS / Linux | Install click-to-activate |
| `install-protocol-handler.ps1` | Windows | Install click-to-activate |

### System Notification

**macOS / Linux:**

```bash
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/notify.sh" "Title" "Content" "${CLAUDE_PROJECT_DIR}"
```

**Windows:**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/notify.ps1" -Title "Title" -Message "Content"
```

### Bark Push

**macOS / Linux — `bark.sh`:**

```bash
# Simple push
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.sh" -u "URL" -m "Task completed"

# With title
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.sh" -u "URL" -t "Claude" -m "Code review done"

# Urgent (ring for 30s)
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.sh" -u "URL" -m "Urgent!" -c

# Grouped message
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.sh" -u "URL" -m "Build done" -g "build"
```

**Windows — `bark.ps1`:**

```powershell
# Simple push
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.ps1" -Url "URL" -Message "Task completed"

# With title
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.ps1" -Url "URL" -Title "Claude" -Message "Code review done"

# Urgent (ring for 30s)
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.ps1" -Url "URL" -Message "Urgent!" -Call

# Grouped message
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.ps1" -Url "URL" -Message "Build done" -Group "build"
```

### Bark Parameters

| Shell (`bark.sh`) | PowerShell (`bark.ps1`) | Description |
|-------------------|------------------------|-------------|
| `-u, --url` | `-Url` | Bark server URL (required) |
| `-m, --message` | `-Message` | Push content (required) |
| `-t, --title` | `-Title` | Push title |
| `-g, --group` | `-Group` | Message group name |
| `-s, --sound` | `-Sound` | Ringtone |
| `-c, --call` | `-Call` | Ring for 30 seconds |
| `-l, --level` | `-Level` | active / timeSensitive / passive |
| `-i, --icon` | `-Icon` | Custom icon URL |
| `-b, --badge` | `-Badge` | Badge number |
| `--copy` | `-Copy` | Content to copy on tap |
| `--auto-copy` | `-AutoCopy` | Auto copy on receive |
| `--archive` | `-Archive` | Save to history |
| `--redirect` | `-RedirectUrl` | URL to open on tap |

## Recommended Usage Scenarios

1. **Long task completion** - Build, test, deploy finished
2. **User confirmation needed** - Use `-c` / `-Call` for urgent
3. **Important milestones** - Code review done, PR created
4. **Error alerts** - Build failed, tests not passing

## Click-to-Activate Feature

Clicking "打开会话" on a notification brings the Claude terminal window to the foreground.

**The protocol handler is automatically installed when the plugin is set up.**

To manually reinstall:

```bash
# macOS / Linux
bash "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/install-protocol-handler.sh"

# Windows
powershell -NoProfile -ExecutionPolicy Bypass -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/install-protocol-handler.ps1"
```

Or use the command: `/notification:install`

### Platform Notes

- **macOS**: Requires `terminal-notifier` (auto-installed via Homebrew). Click uses `-execute` callback.
- **Linux**: Registers `claude://` via `xdg-mime`. Action button requires `notify-send` ≥ 0.8.1. Window activation requires `wmctrl` or `xdotool`.
- **Windows**: Registers `HKCU\Software\Classes\claude` in the registry. Compiled `ClaudeProtocolHandler.exe` handles `claude://activate?session=<id>`.

## Operation Steps

### Configure Bark

**IMPORTANT: Always check existing configuration first**

1. **Check if configuration already exists:**
   - Use Read tool to check `.claude/cong.claude-marketplace.local.md`
   - If `bark_url` exists: show it, ask if they want to modify (use AskUserQuestion)
   - If empty or missing: continue to step 2

2. **Ask user for Bark URL** (only if needed)

3. **Create or update configuration file**

4. **Check if CLAUDE.md needs notification configuration:**
   - Read `.claude/CLAUDE.md`; if it already has "通知功能配置" skip to step 6

5. **Ask about adding to CLAUDE.md** (only if not configured):
   - If yes: append the template below to `.claude/CLAUDE.md`
   - **IMPORTANT**: Replace `{{PLUGIN_PATH}}` with the actual expanded `${CLAUDE_PLUGIN_ROOT}` value

**CLAUDE.md template (macOS/Linux):**

```markdown
## 通知功能配置

### Bark 推送配置
* Bark URL: `<user's bark url>`

### 主动通知场景
AI 应该在以下场景主动发送通知：
1. **长时间任务完成** - 构建、测试、部署等耗时任务完成时
2. **需要用户确认** - 重要决策或需要用户介入时（使用 `-c` 参数持续响铃）
3. **重要里程碑** - 代码审查完成、PR 创建成功等
4. **错误警报** - 构建失败、测试未通过等异常情况

### 发送通知方法
使用 Bash 工具调用 bark.sh 脚本：

\```bash
bash "{{PLUGIN_PATH}}/skills/notification-config/scripts/bark.sh" -u "<bark url>" -t "Claude Code" -m "任务完成"
\```
```

**CLAUDE.md template (Windows):**

```markdown
## 通知功能配置

### Bark 推送配置
* Bark URL: `<user's bark url>`

### 主动通知场景
AI 应该在以下场景主动发送通知：
1. **长时间任务完成** - 构建、测试、部署等耗时任务完成时
2. **需要用户确认** - 重要决策或需要用户介入时（使用 `-Call` 参数持续响铃）
3. **重要里程碑** - 代码审查完成、PR 创建成功等
4. **错误警报** - 构建失败、测试未通过等异常情况

### 发送通知方法
使用 Bash 工具调用 bark.ps1 脚本：

\```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "{{PLUGIN_PATH}}/skills/notification-config/scripts/bark.ps1" -Url "<bark url>" -Title "Claude Code" -Message "任务完成"
\```
```

6. **Remind user about restart** (only if config was created/modified)

### Send Notification Proactively

1. Read `bark_url` from `.claude/cong.claude-marketplace.local.md`
2. Call the appropriate script based on platform (bash or PowerShell)
3. Choose parameters based on urgency

## Platform Notes

- **macOS**: Notification duration controlled by system; `timeout` config has no effect
- **Linux**: `timeout` config controls display duration (requires notify-send)
- **Windows**: Notifications appear in Action Center; `timeout` has no effect
