#!/bin/bash
# Claude Protocol Handler - bring Claude terminal window to front
# Usage: activate.sh [session_id]
# Invoked by: claude://activate?session=<id>

SESSION_ID="${1:-}"

# Strip leading "claude://activate" prefix if passed as full URI
if [[ "$SESSION_ID" == claude://* ]]; then
    SESSION_ID=$(echo "$SESSION_ID" | sed 's/.*[?&]session=\([^&]*\).*/\1/')
    if [[ "$SESSION_ID" == claude://* ]]; then
        SESSION_ID=""
    fi
fi

# ─── macOS ────────────────────────────────────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
    TERMINAL_APPS=("iTerm2" "Terminal" "Alacritty" "kitty" "WarpTerminal" "Hyper" "Code" "Cursor")

    for app in "${TERMINAL_APPS[@]}"; do
        # Check if the app is running
        if ! osascript -e "tell application \"System Events\" to (name of processes) contains \"$app\"" 2>/dev/null | grep -q "true"; then
            continue
        fi

        if [[ -n "$SESSION_ID" ]]; then
            # Try to find window whose title contains the session ID
            FOUND=$(osascript 2>/dev/null <<APPLESCRIPT
tell application "System Events"
    tell process "$app"
        set winList to windows
        repeat with w in winList
            if name of w contains "$SESSION_ID" then
                return "found"
            end if
        end repeat
    end tell
end tell
return "notfound"
APPLESCRIPT
)
            if [[ "$FOUND" != "found" ]]; then
                continue
            fi
        fi

        # Activate the app (bring to front)
        osascript 2>/dev/null <<APPLESCRIPT
tell application "$app" to activate
APPLESCRIPT
        if [[ $? -eq 0 ]]; then
            exit 0
        fi
    done

    echo "Warning: Could not find a Claude-related window to activate." >&2
    exit 1

# ─── Linux ────────────────────────────────────────────────────────────────────
else
    TERMINAL_CLASSES=("x-terminal-emulator" "gnome-terminal" "konsole" "xterm" "alacritty" "kitty" "tilix" "terminator" "code" "cursor")

    activate_by_name() {
        local name_pattern="$1"
        if command -v wmctrl &>/dev/null; then
            wmctrl -a "$name_pattern" 2>/dev/null && return 0
        fi
        if command -v xdotool &>/dev/null; then
            local wid
            wid=$(xdotool search --name "$name_pattern" 2>/dev/null | head -1)
            if [[ -n "$wid" ]]; then
                xdotool windowactivate --sync "$wid" 2>/dev/null && return 0
            fi
        fi
        return 1
    }

    if [[ -n "$SESSION_ID" ]]; then
        # Try to find window with matching title
        if activate_by_name "$SESSION_ID"; then
            exit 0
        fi
    fi

    # Fall back to first available terminal window
    for cls in "${TERMINAL_CLASSES[@]}"; do
        if command -v wmctrl &>/dev/null; then
            WIDS=$(wmctrl -lx 2>/dev/null | grep -i "$cls" | awk '{print $1}' | head -1)
            if [[ -n "$WIDS" ]]; then
                wmctrl -ia "$WIDS" 2>/dev/null && exit 0
            fi
        fi
        if command -v xdotool &>/dev/null; then
            WID=$(xdotool search --class "$cls" 2>/dev/null | head -1)
            if [[ -n "$WID" ]]; then
                xdotool windowactivate --sync "$WID" 2>/dev/null && exit 0
            fi
        fi
    done

    echo "Warning: Could not find a Claude-related window to activate." >&2
    echo "Install wmctrl or xdotool for window activation support." >&2
    exit 1
fi
