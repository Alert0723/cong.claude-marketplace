# Notification

跨平台桌面通知插件（Windows / macOS / Linux），在以下场景发送系统通知（仅当终端在后台时触发）：

- **权限请求** - 需要用户确认权限时
- **任务完成** - Claude 完成任务时

## Install

```bash
/plugin install notification@cong.claude-marketplace
```

## Click to Activate

安装后自动配置，手动重装：

```bash
/notification:install
```

- **Windows**：注册 `claude://` 注册表协议，点击通知的"打开会话"按钮直接激活对应终端窗口
- **macOS**：通过 `terminal-notifier` 实现，自动通过 Homebrew 安装
- **Linux**：通过 `xdg-mime` 注册 `claude://` 协议，需安装 `wmctrl` 或 `xdotool`

## Configuration

配置文件位置：`.claude/cong.claude-marketplace.local.md`

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `bark_url` | string | 空 | Bark 推送地址（iOS 推送） |
| `bark_only` | boolean | false | 仅使用 Bark，跳过系统通知 |
| `timeout` | number | 3000 | 通知显示时长（毫秒，仅 Linux 有效） |
| `always_notify` | boolean | false | 始终通知（包括终端在前台时） |

## Bark Push

```bash
# macOS / Linux
"${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.sh" -u "URL" -m "消息" -t "标题"

# Windows
powershell -File "${CLAUDE_PLUGIN_ROOT}/skills/notification-config/scripts/bark.ps1" -Url "URL" -Message "消息" -Title "标题"
```

更好的方式是从项目配置文件读取 Bark URL：

```bash
# 1. 检查配置文件是否存在
if [ -f ".claude/cong.claude-marketplace.local.md" ]; then
    # 2. 提取 bark_url
    BARK_URL=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' .claude/cong.claude-marketplace.local.md | grep '^bark_url:' | sed 's/bark_url: *//' | sed 's/^"\(.*\)"$/\1/')

    # 3. 如果配置了 Bark，发送通知
    if [ -n "$BARK_URL" ]; then
        bash ~/.claude/plugins/cache/cong.claude-marketplace/*/skills/notification-config/scripts/bark.sh -u "$BARK_URL" -t "Claude Code" -m "任务已完成"
    fi
fi
```

## Requirements

- **macOS**: Homebrew (自动安装 terminal-notifier)
- **Linux**: `libnotify-bin`, `wmctrl` 或 `xdotool`
- **Windows**: Windows 10+

## Uninstall

```bash
/notification:uninstall
```

此命令将：
1. 卸载协议处理器（Windows 注册表 / Linux xdg-mime）
2. 卸载插件文件
3. 可选卸载 terminal-notifier（macOS）

---

## License

MIT
