---
description: Configure claude-hud as your statusline
allowed-tools: Bash, Read, Edit, AskUserQuestion
---

**Note**: Placeholders like `{RUNTIME_PATH}`, `{SOURCE}`, and `{GENERATED_COMMAND}` should be substituted with actual detected values.

## Step 0: Detect Ghost Installation (Run First)

Check for inconsistent plugin state that can occur after failed installations:

**macOS/Linux**:
```bash
# Check 1: Cache exists?
CACHE_EXISTS=$(ls -d ~/.claude/plugins/cache/claude-hud 2>/dev/null && echo "YES" || echo "NO")

# Check 2: Registry entry exists?
REGISTRY_EXISTS=$(grep -q "claude-hud" ~/.claude/plugins/installed_plugins.json 2>/dev/null && echo "YES" || echo "NO")

# Check 3: Temp files left behind?
TEMP_FILES=$(ls -d ~/.claude/plugins/cache/temp_local_* 2>/dev/null | head -1)

echo "Cache: $CACHE_EXISTS | Registry: $REGISTRY_EXISTS | Temp: ${TEMP_FILES:-none}"
```

**Windows (PowerShell)**:
```powershell
$cache = Test-Path "$env:USERPROFILE\.claude\plugins\cache\claude-hud"
$registry = (Get-Content "$env:USERPROFILE\.claude\plugins\installed_plugins.json" -ErrorAction SilentlyContinue) -match "claude-hud"
$temp = Get-ChildItem "$env:USERPROFILE\.claude\plugins\cache\temp_local_*" -ErrorAction SilentlyContinue
Write-Host "Cache: $cache | Registry: $registry | Temp: $($temp.Count) files"
```

### Interpreting Results

| Cache | Registry | Meaning | Action |
|-------|----------|---------|--------|
| YES | YES | Normal install (may still be broken) | Continue to Step 1 |
| YES | NO | Ghost install - cache orphaned | Clean up cache |
| NO | YES | Ghost install - registry stale | Clean up registry |
| NO | NO | Not installed | Continue to Step 1 |

If **temp files exist**, a previous install was interrupted. Clean them up.

### Cleanup Commands

If ghost installation detected, ask user if they want to reset. If yes:

**macOS/Linux**:
```bash
# Remove orphaned cache
rm -rf ~/.claude/plugins/cache/claude-hud

# Remove temp files from failed installs
rm -rf ~/.claude/plugins/cache/temp_local_*

# Reset registry (removes ALL plugins - warn user first!)
# Only run if user confirms they have no other plugins they want to keep:
echo '{"version": 2, "plugins": {}}' > ~/.claude/plugins/installed_plugins.json
```

**Windows (PowerShell)**:
```powershell
# Remove orphaned cache
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\plugins\cache\claude-hud" -ErrorAction SilentlyContinue

# Remove temp files
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\plugins\cache\temp_local_*" -ErrorAction SilentlyContinue

# Reset registry (removes ALL plugins - warn user first!)
'{"version": 2, "plugins": {}}' | Set-Content "$env:USERPROFILE\.claude\plugins\installed_plugins.json"
```

After cleanup, tell user to **restart Claude Code** and run `/plugin install claude-hud` again.

### Linux: Cross-Device Filesystem Check

**On Linux only**, if install keeps failing, check for EXDEV issue:
```bash
[ "$(df --output=source ~ /tmp 2>/dev/null | tail -2 | uniq | wc -l)" = "2" ] && echo "CROSS_DEVICE"
```

If this outputs `CROSS_DEVICE`, `/tmp` and home are on different filesystems. This causes `EXDEV: cross-device link not permitted` during installation. Workaround:
```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp claude /plugin install claude-hud
```

This is a [Claude Code platform limitation](https://github.com/anthropics/claude-code/issues/14799).

---

## Step 1: Detect Platform & Runtime

**IMPORTANT**: Determine the platform from your environment context (`Platform:` value), NOT from `uname -s`. The Bash tool may report a different environment than the user's actual platform (e.g., Git Bash on Windows reports MINGW even when the user launched Claude Code from PowerShell).

| Platform | Command Format |
|----------|---------------|
| `darwin` | bash (macOS) |
| `linux` | bash (all Linux distros including NixOS, Ubuntu, Arch, etc.) |
| `win32` | PowerShell (works universally on Windows 10+) |

---

**macOS/Linux** (Platform: `darwin` or `linux`):

1. Get plugin path:
   ```bash
   ls -td ~/.claude/plugins/cache/claude-hud/claude-hud/*/ 2>/dev/null | head -1
   ```
   If empty, the plugin is not installed. Go back to Step 0 to check for ghost installation or EXDEV issues. If Step 0 was clean, tell user to install via `/plugin install claude-hud` first.

2. Get runtime absolute path (prefer bun for performance, fallback to node):
   ```bash
   command -v bun 2>/dev/null || command -v node 2>/dev/null
   ```

   If empty, stop and tell user to install Node.js or Bun.

3. Verify the runtime exists:
   ```bash
   ls -la {RUNTIME_PATH}
   ```
   If it doesn't exist, re-detect or ask user to verify their installation.

4. Determine source file based on runtime:
   ```bash
   basename {RUNTIME_PATH}
   ```
   If result is "bun", use `src/index.ts` (bun has native TypeScript support). Otherwise use `dist/index.js` (pre-compiled).

5. Generate command (quotes around runtime path handle spaces):
   ```
   bash -c '"{RUNTIME_PATH}" "$(ls -td ~/.claude/plugins/cache/claude-hud/claude-hud/*/ 2>/dev/null | head -1){SOURCE}"'
   ```

**Windows** (Platform: `win32`):

**Method A: Using bundled PowerShell script (recommended)**

The plugin includes a `setup.ps1` script in its `commands/` folder that automatically:
1. Finds the latest installed version of claude-hud
2. Detects the runtime (bun or node)
3. Runs the correct entry point

Configuration in `settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -NoLogo -ExecutionPolicy Bypass -File \"C:\\Users\\conghuang\\.claude\\plugins\\cache\\cong-claude-marketplace\\claude-hud\\{VERSION}\\commands\\setup.ps1\""
  }
}
```

**Method B: Using PowerShell script with dynamic lookup**

1. Check if `node` is available:
   ```powershell
   Get-Command node -ErrorAction SilentlyContinue
   ```

2. Get plugin path (same as Method A step 1).

3. Generate command using `node` (no need for absolute path):
   ```
   node C:\Users\conghuang\.claude\plugins\cache\claude-hud\claude-hud\{VERSION}\dist\index.js
   ```
   Replace `{VERSION}` with the detected version number.

**Method C: Using bundled setup.ps1 (automatic, recommended)**

1. Get plugin path:
   ```powershell
   (Get-ChildItem "$env:USERPROFILE\.claude\plugins\cache\cong-claude-marketplace\claude-hud" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
   ```

2. Get runtime path:
   ```powershell
   if (Get-Command bun -ErrorAction SilentlyContinue) { (Get-Command bun).Source } elseif (Get-Command node -ErrorAction SilentlyContinue) { (Get-Command node).Source } else { Write-Error "Neither bun nor node found" }
   ```

3. Determine source file based on runtime:
   - If runtime name starts with "bun" → use `src\index.ts`
   - Otherwise → use `dist\index.js`

4. Generate command:
   ```
   powershell -NoProfile -NoLogo -ExecutionPolicy Bypass -File "{PLUGIN_PATH}\commands\setup.ps1"
   ```

**WSL (Windows Subsystem for Linux)**: If running in WSL, use the macOS/Linux instructions. Ensure the plugin is installed in the Linux environment (`~/.claude/plugins/...`), not the Windows side.

## Step 2: Test Command

Run the generated command. It should produce output (the HUD lines) within a few seconds.

- If it errors, do not proceed to Step 3.
- If it hangs for more than a few seconds, cancel and debug.
- This test catches issues like broken runtime binaries, missing plugins, or path problems.

## Step 3: Apply Configuration

Read the settings file and merge in the statusLine config, preserving all existing settings:
- **macOS/Linux/Git Bash**: `~/.claude/settings.json`
- **Windows (native PowerShell)**: `$env:USERPROFILE\.claude\settings.json`

If the file doesn't exist, create it. If it contains invalid JSON, report the error and do not overwrite.
If a write fails with `File has been unexpectedly modified`, re-read the file and retry the merge once.

**Important for Windows**: When using Python's json module or similar tools to write the settings, ensure backslashes are properly escaped. The command string should contain single backslashes in JSON (e.g., `C:\\Users\\...`).

```json
{
  "statusLine": {
    "type": "command",
    "command": "{GENERATED_COMMAND}"
  }
}
```

**Windows examples using bundled setup.ps1 (recommended)**:
```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -NoLogo -ExecutionPolicy Bypass -File \"C:\\Users\\conghuang\\.claude\\plugins\\cache\\cong-claude-marketplace\\claude-hud\\0.0.9\\commands\\setup.ps1\""
  }
}
```

**Note**: The generated command dynamically finds and runs the latest installed plugin version. Updates are automatic - no need to re-run setup after plugin updates. If the HUD suddenly stops working, re-run `/claude-hud:setup` to verify the plugin is still installed.

## Step 4: Optional Features

After the statusLine is applied, ask the user if they'd like to enable additional HUD features beyond the default 2-line display.

Use AskUserQuestion:
- header: "Extras"
- question: "Enable any optional HUD features? (all hidden by default)"
- multiSelect: true
- options:
  - "Tools activity" — Shows running/completed tools (◐ Edit: file.ts | ✓ Read ×3)
  - "Agents & Todos" — Shows subagent status and todo progress
  - "Session info" — Shows session duration and config counts (CLAUDE.md, rules, MCPs)
  - "Token details" — Shows detailed cumulative token breakdown for current session (input, output, cache hit rate)

**If user selects any options**, write `~/.claude/plugins/claude-hud/config.json` (create directories if needed):

| Selection | Config keys |
|-----------|------------|
| Tools activity | `display.showTools: true` |
| Agents & Todos | `display.showAgents: true, display.showTodos: true` |
| Session info | `display.showDuration: true, display.showConfigCounts: true` |
| Token details | `display.showTokenDetails: true` |

Merge with existing config if the file already exists. Only write keys the user selected — don't write `false` for unselected items (defaults handle that).

**If user selects nothing** (or picks "Other" and says skip/none), do not create a config file. The defaults are fine.

---

## Step 5: Verify & Finish

Use AskUserQuestion:
- Question: "Setup complete! The HUD should appear below your input field. Is it working?"
- Options: "Yes, it's working" / "No, something's wrong"

**If yes**: Setup complete.

**If no**: Debug systematically:

1. **Verify config was applied**:
   - Read settings file (`~/.claude/settings.json` or `$env:USERPROFILE\.claude\settings.json` on Windows)
   - Check statusLine.command exists and looks correct
   - If command contains a hardcoded version path (not using dynamic `ls -td` lookup), it may be a stale config from a previous setup

2. **Test the command manually** and capture error output:
   ```bash
   {GENERATED_COMMAND} 2>&1
   ```

3. **Common issues to check**:

   **"command not found" or empty output**:
   - Runtime path might be wrong: `ls -la {RUNTIME_PATH}`
   - On macOS with mise/nvm/asdf: the absolute path may have changed after a runtime update
   - Symlinks may be stale: `command -v node` often returns a symlink that can break after version updates
   - Solution: re-detect with `command -v bun` or `command -v node`, and verify with `realpath {RUNTIME_PATH}` (or `readlink -f {RUNTIME_PATH}`) to get the true absolute path

   **"No such file or directory" for plugin**:
   - Plugin might not be installed: `ls ~/.claude/plugins/cache/claude-hud/`
   - Solution: reinstall plugin via marketplace

   **Windows: "bash not recognized"**:
   - Wrong command type for Windows
   - Solution: use the PowerShell command variant

   **Windows: PowerShell execution policy error**:
   - Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

   **Windows: JSON parsing error**:
   - Backslashes in JSON must be properly escaped (double backslashes `\\` for single `\`)
   - Use Python's json.dump() or similar tools to ensure correct escaping
   - Test with: `python3 -m json.tool ~/.claude/settings.json`

   **Windows: Command executes but no output**:
   - Check if PowerShell is correctly executing the script
   - Test manually: `powershell -NoProfile -NonInteractive -Command "& '$env:USERPROFILE\.claude\claude-hud.ps1'"`
   - Ensure the launcher script exists: `Test-Path "$env:USERPROFILE\.claude\claude-hud.ps1"`

   **Windows: Node.js not in PATH**:
   - Use absolute path to node.exe instead of just `node`
   - Example: `E:\nvm4w\nodejs\node.exe`

   **Permission denied**:
   - Runtime not executable: `chmod +x {RUNTIME_PATH}`

   **WSL confusion**:
   - If using WSL, ensure plugin is installed in Linux environment, not Windows
   - Check: `ls ~/.claude/plugins/cache/claude-hud/`

4. **If still stuck**: Show the user the exact command that was generated and the error, so they can report it or debug further
