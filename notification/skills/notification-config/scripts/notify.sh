#!/bin/bash
# Claude Code Notification Script for macOS/Linux

DIR="${1:-}"
REASON="${2:-}"
SESSION_ID="${3:-}"
TRANSCRIPT_PATH="${4:-}"

# 默认配置
BARK_URL=""
BARK_ONLY="false"
TIMEOUT=3000
ALWAYS_NOTIFY="false"

# 读取配置文件
CONFIG_FILE="$DIR/.claude/cong.claude-marketplace.local.md"
if [[ -f "$CONFIG_FILE" ]]; then
    # 提取 YAML frontmatter
    FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$CONFIG_FILE")

    # 解析配置项
    if [[ -n "$FRONTMATTER" ]]; then
        # 提取 bark_url
        BARK_URL=$(echo "$FRONTMATTER" | grep '^bark_url:' | sed 's/bark_url: *//' | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
        # 提取 bark_only
        BARK_ONLY_VAL=$(echo "$FRONTMATTER" | grep '^bark_only:' | sed 's/bark_only: *//')
        if [[ "$BARK_ONLY_VAL" == "true" ]]; then
            BARK_ONLY="true"
        fi
        # 提取 timeout
        TIMEOUT_VAL=$(echo "$FRONTMATTER" | grep '^timeout:' | sed 's/timeout: *//')
        if [[ "$TIMEOUT_VAL" =~ ^[0-9]+$ ]]; then
            TIMEOUT=$TIMEOUT_VAL
        fi
        # 提取 always_notify
        ALWAYS_NOTIFY_VAL=$(echo "$FRONTMATTER" | grep '^always_notify:' | sed 's/always_notify: *//')
        if [[ "$ALWAYS_NOTIFY_VAL" == "true" ]]; then
            ALWAYS_NOTIFY="true"
        fi
    fi
fi

# 从 transcript 获取最后一条用户消息
get_last_user_message() {
    local transcript_path="$1"
    if [[ -z "$transcript_path" ]] || [[ ! -f "$transcript_path" ]]; then
        echo ""
        return
    fi

    # 读取 transcript 文件（JSONL 格式），找到最后一个 user_message
    # 用户消息格式: {"message":{"content":[{"type":"user_message","text":"..."}]}}
    local last_message=$(tac "$transcript_path" 2>/dev/null | grep -o '"type":"user_message"' | head -1)

    if [[ -n "$last_message" ]]; then
        # 提取 text 字段
        local line=$(tac "$transcript_path" 2>/dev/null | grep '"type":"user_message"' | head -1)
        local text=$(echo "$line" | grep -o '"text":"[^"]*"' | sed 's/"text":"//' | sed 's/"$//' | head -c 100)
        if [[ -n "$text" ]]; then
            echo "$text"
            return
        fi
    fi

    echo ""
}

# 构建通知内容
build_notification_content() {
    local reason="$REASON"
    local session_name="$SESSION_ID"
    local last_message=$(get_last_user_message "$TRANSCRIPT_PATH")

    # 默认标题
    local title="Claude Code"

    # 如果有 session_id，用作对话名称
    if [[ -n "$session_name" ]]; then
        # 只取前 8 位字符作为对话名称
        session_name=$(echo "$session_name" | head -c 8)
        title="$title - [$session_name]"
    fi

    # 默认消息
    local message="会话已完成"

    # 根据原因设置消息
    if [[ -n "$reason" ]]; then
        case "$reason" in
            "user_requested"|"User requested")
                message="您手动结束了会话"
                ;;
            "timeout"|"Timeout")
                message="会话超时结束"
                ;;
            "error"|"Error")
                message="会话因错误结束"
                ;;
            *)
                message="会话已完成"
                ;;
        esac
    fi

    # 如果有最后一条用户消息，添加到消息中
    if [[ -n "$last_message" ]]; then
        message="$message - $last_message"
    fi

    # 添加目录信息
    if [[ -n "$DIR" ]]; then
        SHORT_DIR=$(echo "$DIR" | rev | cut -d'/' -f1-2 | rev)
        message="$message - $SHORT_DIR"
    fi

    echo "$title|$message"
}

# 检测前台应用是否是终端
send_notification() {
    local should_notify=false

    # 如果配置了 always_notify，直接发送通知
    if [[ "$ALWAYS_NOTIFY" == "true" ]]; then
        should_notify=true
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - 检测前台应用
        FRONT_APP=$(osascript -e 'tell application "System Events" to get name of first process whose frontmost is true' 2>/dev/null)
        TERMINALS="Terminal|iTerm|iTerm2|Alacritty|kitty|Warp|Hyper|Code|Cursor|VSCodium"

        if [[ ! "$FRONT_APP" =~ ^($TERMINALS)$ ]]; then
            should_notify=true
        fi
    else
        # Linux - 始终发送通知
        should_notify=true
    fi

    if [[ "$should_notify" == "true" ]]; then
        # 构建通知内容
        local result=$(build_notification_content)
        TITLE=$(echo "$result" | cut -d'|' -f1)
        MESSAGE=$(echo "$result" | cut -d'|' -f2-)

        # 发送 Bark 通知
        if [[ -n "$BARK_URL" ]]; then
            ENCODED_TITLE=$(printf '%s' "$TITLE" | jq -sRr @uri 2>/dev/null || echo "$TITLE")
            ENCODED_MESSAGE=$(printf '%s' "$MESSAGE" | jq -sRr @uri 2>/dev/null || echo "$MESSAGE")
            curl -s -m 5 "$BARK_URL/$ENCODED_TITLE/$ENCODED_MESSAGE" >/dev/null 2>&1 || true
        fi

        # 发送系统通知（除非 bark_only 为 true）
        if [[ "$BARK_ONLY" != "true" ]]; then
            SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
            ACTIVATE_SCRIPT="$SCRIPT_DIR/activate.sh"

            if [[ "$OSTYPE" == "darwin"* ]]; then
                # 优先使用 terminal-notifier（支持点击激活）
                if command -v terminal-notifier &>/dev/null; then
                    if [[ -n "$SESSION_ID" ]]; then
                        EXECUTE_CMD="\"$ACTIVATE_SCRIPT\" \"$SESSION_ID\""
                    else
                        EXECUTE_CMD="\"$ACTIVATE_SCRIPT\""
                    fi
                    terminal-notifier \
                        -title "$TITLE" \
                        -message "$MESSAGE" \
                        -execute "$EXECUTE_CMD" \
                        -actions "打开会话" \
                        -sound default \
                        2>/dev/null || \
                    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\""
                else
                    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\""
                fi
            else
                # Linux
                if command -v notify-send &>/dev/null; then
                    # 检测 notify-send 是否支持 --action（v0.8.1+）
                    NOTIFYSEND_VER=$(notify-send --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+' | head -1)
                    SUPPORTS_ACTION=false
                    if [[ -n "$NOTIFYSEND_VER" ]]; then
                        MAJOR=$(echo "$NOTIFYSEND_VER" | cut -d. -f1)
                        MINOR=$(echo "$NOTIFYSEND_VER" | cut -d. -f2)
                        PATCH=$(echo "$NOTIFYSEND_VER" | cut -d. -f3)
                        if [[ "$MAJOR" -gt 0 ]] || [[ "$MAJOR" -eq 0 && "$MINOR" -gt 8 ]] || [[ "$MAJOR" -eq 0 && "$MINOR" -eq 8 && "$PATCH" -ge 1 ]]; then
                            SUPPORTS_ACTION=true
                        fi
                    fi

                    if [[ "$SUPPORTS_ACTION" == "true" ]]; then
                        # 后台异步等待点击事件
                        (
                            CLICKED=$(notify-send --action="activate=打开会话" -t "$TIMEOUT" "$TITLE" "$MESSAGE" 2>/dev/null)
                            if [[ "$CLICKED" == "activate" ]]; then
                                "$ACTIVATE_SCRIPT" "$SESSION_ID" 2>/dev/null
                            fi
                        ) &
                    else
                        notify-send "$TITLE" "$MESSAGE" -t "$TIMEOUT"
                    fi
                fi
            fi
        fi
    fi
}

send_notification
