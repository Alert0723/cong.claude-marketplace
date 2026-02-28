# Merge notification-windows + notification-unix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge `notification/windows` and `notification/unix` into a single `notification/` plugin named `notification` (v2.0.0) using dual-entry point strategy: both platform scripts coexist under one shared `hooks.json`, `SKILL.md`, and `commands/`.

**Architecture:** Platform scripts (`.sh` / `.ps1`) remain independent. `hooks.json` lists both a bash and a PowerShell hook per event; each silently no-ops on the incompatible platform. `SKILL.md` and `commands/install.md` are merged into single files with platform-branched sections.

**Tech Stack:** bash, PowerShell, Windows Toast (WinRT), osascript, terminal-notifier, notify-send, wmctrl/xdotool, xdg-mime, Windows Registry

---

## Task 1: Create unified plugin directory scaffold

**Files:**
- Create: `notification/.claude-plugin/plugin.json`
- Create: `notification/hooks/` (dir)
- Create: `notification/commands/` (dir)
- Create: `notification/skills/notification-config/scripts/` (dir)

**Step 1: Create directories**

```bash
mkdir -p E:/Projects/cong.claude-marketplace/notification/.claude-plugin
mkdir -p E:/Projects/cong.claude-marketplace/notification/hooks
mkdir -p E:/Projects/cong.claude-marketplace/notification/commands
mkdir -p E:/Projects/cong.claude-marketplace/notification/skills/notification-config/scripts
```

**Step 2: Write plugin.json**

Create `notification/.claude-plugin/plugin.json`:

```json
{
  "name": "notification",
  "description": "桌面通知 - 任务完成时发送通知（Windows / macOS / Linux）",
  "version": "2.0.0",
  "author": {
    "name": "conghuang"
  }
}
```

**Step 3: Verify**

```bash
cat E:/Projects/cong.claude-marketplace/notification/.claude-plugin/plugin.json
```

Expected: JSON with `"name": "notification"` and `"version": "2.0.0"`.

**Step 4: Commit**

```bash
cd E:/Projects/cong.claude-marketplace
git add notification/.claude-plugin/plugin.json
git commit -m "feat: scaffold unified notification plugin directory"
```

---

## Task 2: Copy all platform scripts

**Files:**
- Copy from `notification/unix/skills/notification-config/scripts/` → `notification/skills/notification-config/scripts/`
- Copy from `notification/windows/skills/notification-config/scripts/` → `notification/skills/notification-config/scripts/`

**Step 1: Copy Unix scripts**

```bash
cp notification/unix/skills/notification-config/scripts/notify.sh \
   notification/skills/notification-config/scripts/notify.sh

cp notification/unix/skills/notification-config/scripts/bark.sh \
   notification/skills/notification-config/scripts/bark.sh

cp notification/unix/skills/notification-config/scripts/activate.sh \
   notification/skills/notification-config/scripts/activate.sh

cp notification/unix/skills/notification-config/scripts/install-protocol-handler.sh \
   notification/skills/notification-config/scripts/install-protocol-handler.sh
```

Working directory: `E:/Projects/cong.claude-marketplace`

**Step 2: Copy Windows scripts**

```bash
cp notification/windows/skills/notification-config/scripts/notify.ps1 \
   notification/skills/notification-config/scripts/notify.ps1

cp notification/windows/skills/notification-config/scripts/bark.ps1 \
   notification/skills/notification-config/scripts/bark.ps1

cp notification/windows/skills/notification-config/scripts/install-protocol-handler.ps1 \
   notification/skills/notification-config/scripts/install-protocol-handler.ps1

cp notification/windows/skills/notification-config/scripts/ClaudeProtocolHandler.cs \
   notification/skills/notification-config/scripts/ClaudeProtocolHandler.cs

cp notification/windows/skills/notification-config/scripts/ClaudeProtocolHandler.exe \
   notification/skills/notification-config/scripts/ClaudeProtocolHandler.exe
```

**Step 3: Verify all 9 scripts present**

```bash
ls notification/skills/notification-config/scripts/
```

Expected output (9 files):
```
activate.sh
bark.ps1
bark.sh
ClaudeProtocolHandler.cs
ClaudeProtocolHandler.exe
install-protocol-handler.ps1
install-protocol-handler.sh
notify.ps1
notify.sh
```

**Step 4: Commit**

```bash
git add notification/skills/
git commit -m "feat: copy all platform scripts into unified notification plugin"
```

---

## Task 3: Write unified hooks.json

**Files:**
- Create: `notification/hooks/hooks.json`

**Step 1: Write the file**

Create `notification/hooks/hooks.json` with the content below. Each event has two parallel hooks — bash (Unix) and PowerShell (Windows). The incompatible one exits silently.

```json
{
  "description": "桌面通知（Windows / macOS / Linux）",
  "hooks": {
    "Setup": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/install-protocol-handler.sh\"",
            "timeout": 60
          }
        ]
      },
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/install-protocol-handler.ps1\"",
            "timeout": 30
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/notify.sh\" \"Claude Code\" \"需要权限确认\" \"${CLAUDE_PROJECT_DIR}\"",
            "timeout": 10
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/notify.ps1\" -Title \"Claude Code\" -Message \"需要权限确认\"",
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/notify.sh\" \"Claude Code\" \"任务已完成\" \"${CLAUDE_PROJECT_DIR}\"",
            "timeout": 10
          }
        ]
      },
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/notify.ps1\" -Title \"Claude Code\" -Message \"任务已完成\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Step 2: Verify JSON is valid**

```bash
python3 -c "import json,sys; json.load(open('notification/hooks/hooks.json')); print('valid')" 2>/dev/null || \
node -e "JSON.parse(require('fs').readFileSync('notification/hooks/hooks.json','utf8')); console.log('valid')"
```

Expected: `valid`

**Step 3: Commit**

```bash
git add notification/hooks/hooks.json
git commit -m "feat: add unified dual-platform hooks.json"
```

---

## Task 4: Write merged SKILL.md

**Files:**
- Create: `notification/skills/notification-config/SKILL.md`

This merges both platforms' SKILL.md into one file. Windows-specific content (PowerShell commands) and Unix-specific content (bash commands) are placed in clearly labelled sections.

**Step 1: Write the file**

Create `notification/skills/notification-config/SKILL.md`:

````markdown
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
````

**Step 2: Verify the file exists**

```bash
head -5 notification/skills/notification-config/SKILL.md
```

Expected: YAML frontmatter with `name: notification-config`.

**Step 3: Commit**

```bash
git add notification/skills/notification-config/SKILL.md
git commit -m "feat: add merged SKILL.md for unified notification plugin"
```

---

## Task 5: Write unified commands/install.md

**Files:**
- Create: `notification/commands/install.md`

**Step 1: Write the file**

Create `notification/commands/install.md`:

````markdown
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
````

**Step 2: Verify**

```bash
head -3 notification/commands/install.md
```

Expected: YAML frontmatter with `description:`.

**Step 3: Commit**

```bash
git add notification/commands/install.md
git commit -m "feat: add unified /notification:install command"
```

---

## Task 6: Update marketplace.json

**Files:**
- Modify: `.claude-plugin/marketplace.json`

**Step 1: Replace the two notification entries with one**

In `.claude-plugin/marketplace.json`, replace:

```json
    {
      "name": "notification-windows",
      "source": "./notification/windows",
      "description": "Windows 桌面通知（PowerShell）"
    },
    {
      "name": "notification-unix",
      "source": "./notification/unix",
      "description": "macOS/Linux 桌面通知（Shell）"
    },
```

With:

```json
    {
      "name": "notification",
      "source": "./notification",
      "description": "桌面通知（Windows / macOS / Linux）"
    },
```

**Step 2: Verify JSON is valid**

```bash
python3 -c "import json,sys; json.load(open('.claude-plugin/marketplace.json')); print('valid')" 2>/dev/null || \
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('valid')"
```

Expected: `valid`

**Step 3: Verify the entry**

```bash
grep -A3 '"notification"' .claude-plugin/marketplace.json
```

Expected: single entry with `"source": "./notification"`.

**Step 4: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat: update marketplace.json to reference unified notification plugin"
```

---

## Task 7: Delete old platform subdirectories

**Files:**
- Delete: `notification/unix/` (entire directory)
- Delete: `notification/windows/` (entire directory)

**Step 1: Remove directories**

```bash
rm -rf E:/Projects/cong.claude-marketplace/notification/unix
rm -rf E:/Projects/cong.claude-marketplace/notification/windows
```

**Step 2: Verify only unified plugin remains**

```bash
find E:/Projects/cong.claude-marketplace/notification -type f | sort
```

Expected (12 files, no `unix/` or `windows/` paths):
```
notification/.claude-plugin/plugin.json
notification/commands/install.md
notification/hooks/hooks.json
notification/skills/notification-config/SKILL.md
notification/skills/notification-config/scripts/activate.sh
notification/skills/notification-config/scripts/bark.ps1
notification/skills/notification-config/scripts/bark.sh
notification/skills/notification-config/scripts/ClaudeProtocolHandler.cs
notification/skills/notification-config/scripts/ClaudeProtocolHandler.exe
notification/skills/notification-config/scripts/install-protocol-handler.ps1
notification/skills/notification-config/scripts/install-protocol-handler.sh
notification/skills/notification-config/scripts/notify.ps1
notification/skills/notification-config/scripts/notify.sh
```

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: remove legacy notification/unix and notification/windows after merge

BREAKING CHANGE: notification-windows and notification-unix are replaced
by the unified 'notification' plugin (v2.0.0). Update any references to
use the new plugin name."
```

---

## Verification Checklist

After all tasks complete, confirm:

- [ ] `notification/.claude-plugin/plugin.json` → `"name": "notification"`, `"version": "2.0.0"`
- [ ] `notification/hooks/hooks.json` → 3 events × 2 hooks each (bash + PowerShell)
- [ ] `notification/commands/install.md` → frontmatter has `description:`
- [ ] `notification/skills/notification-config/SKILL.md` → frontmatter has `name: notification-config`
- [ ] 9 scripts present under `notification/skills/notification-config/scripts/`
- [ ] `.claude-plugin/marketplace.json` → single `notification` entry, no `notification-windows`/`notification-unix`
- [ ] `notification/unix/` deleted
- [ ] `notification/windows/` deleted
- [ ] `git log --oneline -7` shows 6 commits for this feature
