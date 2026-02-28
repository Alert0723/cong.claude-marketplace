#!/bin/bash
# Claude Protocol Handler installer for macOS/Linux
# Registers claude:// URI scheme so clicking notifications activates the terminal

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTIVATE_SCRIPT="$SCRIPT_DIR/activate.sh"
chmod +x "$ACTIVATE_SCRIPT" 2>/dev/null || true

UNINSTALL="${1:-}"

# ─── macOS ────────────────────────────────────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then

    if [[ "$UNINSTALL" == "--uninstall" ]]; then
        brew uninstall terminal-notifier 2>/dev/null || true
        echo "terminal-notifier uninstalled (if it was installed by this script)."
        echo "Note: the claude:// protocol is handled via terminal-notifier -execute and requires no system registration."
        exit 0
    fi

    echo "Checking for terminal-notifier..."
    if command -v terminal-notifier &>/dev/null; then
        echo "terminal-notifier already installed: $(which terminal-notifier)"
    else
        echo "terminal-notifier not found."
        if command -v brew &>/dev/null; then
            echo "Installing via Homebrew..."
            brew install terminal-notifier
        else
            echo ""
            echo "ERROR: Homebrew not found. Please install terminal-notifier manually:"
            echo "  brew install terminal-notifier"
            echo "  OR: https://github.com/julienXX/terminal-notifier/releases"
            exit 1
        fi
    fi

    echo ""
    echo "=================================================="
    echo "Claude click-to-activate ready for macOS!"
    echo "=================================================="
    echo ""
    echo "Notifications will include an '打开会话' action button."
    echo "Requires: terminal-notifier $(terminal-notifier -version 2>/dev/null || echo '(installed)')"
    echo "Activate script: $ACTIVATE_SCRIPT"

# ─── Linux ────────────────────────────────────────────────────────────────────
else

    DESKTOP_DIR="$HOME/.local/share/applications"
    DESKTOP_FILE="$DESKTOP_DIR/claude-protocol.desktop"

    if [[ "$UNINSTALL" == "--uninstall" ]]; then
        rm -f "$DESKTOP_FILE"
        update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
        echo "claude:// protocol handler uninstalled."
        exit 0
    fi

    mkdir -p "$DESKTOP_DIR"

    cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=Claude Protocol Handler
Comment=Activates Claude Code terminal window from notifications
Exec=$ACTIVATE_SCRIPT %u
Type=Application
MimeType=x-scheme-handler/claude;
NoDisplay=true
Terminal=false
EOF

    chmod +x "$DESKTOP_FILE"

    # Register the protocol handler
    if command -v xdg-mime &>/dev/null; then
        xdg-mime default claude-protocol.desktop x-scheme-handler/claude
    fi

    # Update desktop database
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true

    echo ""
    echo "=================================================="
    echo "Claude click-to-activate ready for Linux!"
    echo "=================================================="
    echo ""
    echo "Registered: $DESKTOP_FILE"
    echo "Protocol:   claude:// -> $ACTIVATE_SCRIPT"
    echo ""
    echo "For window activation, install one of:"
    echo "  sudo apt install wmctrl    (recommended)"
    echo "  sudo apt install xdotool"

    # Check notify-send action support
    echo ""
    NOTIFYSEND_VER=$(notify-send --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+' | head -1)
    if [[ -n "$NOTIFYSEND_VER" ]]; then
        echo "notify-send version: $NOTIFYSEND_VER"
        # v0.8.1+ supports --action
        MAJOR=$(echo "$NOTIFYSEND_VER" | cut -d. -f1)
        MINOR=$(echo "$NOTIFYSEND_VER" | cut -d. -f2)
        PATCH=$(echo "$NOTIFYSEND_VER" | cut -d. -f3)
        if [[ "$MAJOR" -gt 0 ]] || [[ "$MAJOR" -eq 0 && "$MINOR" -gt 8 ]] || [[ "$MAJOR" -eq 0 && "$MINOR" -eq 8 && "$PATCH" -ge 1 ]]; then
            echo "Action button support: YES (notify-send >= 0.8.1)"
        else
            echo "Action button support: NO (notify-send < 0.8.1)"
            echo "  Upgrade libnotify for '打开会话' button support."
        fi
    fi
fi
