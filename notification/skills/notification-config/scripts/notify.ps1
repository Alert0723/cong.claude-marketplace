param(
    [string]$Dir = "",
    [string]$Reason = "",
    [string]$SessionId = "",
    [string]$TranscriptPath = "",
    [string]$ActivateUrl = "claude://activate"
)

# 如果 Dir 为空或未展开，尝试从环境变量获取
if (-not $Dir -or $Dir -eq '${CLAUDE_PROJECT_DIR}' -or $Dir -eq '$CLAUDE_PROJECT_DIR') {
    $Dir = $env:CLAUDE_PROJECT_DIR
    if (-not $Dir) {
        $Dir = Get-Location
    }
}

# 读取配置文件
$configFile = Join-Path $Dir ".claude/cong.claude-marketplace.local.md"
$barkUrl = ""
$barkOnly = $false
$alwaysNotify = $false

if (Test-Path $configFile) {
    $content = Get-Content $configFile -Raw
    if ($content -match '(?s)^---\r?\n(.+?)\r?\n---') {
        $frontmatter = $Matches[1]
        if ($frontmatter -match 'bark_url:\s*[''"]?([^''"}\r\n]+)[''"]?') {
            $barkUrl = $Matches[1].Trim()
        }
        if ($frontmatter -match 'bark_only:\s*(true|false)') {
            $barkOnly = $Matches[1] -eq 'true'
        }
        if ($frontmatter -match 'always_notify:\s*(true|false)') {
            $alwaysNotify = $Matches[1] -eq 'true'
        }
    }
}

# 从 transcript 获取最后一条用户消息
function Get-LastUserMessage {
    param([string]$transcriptPath)

    if ([string]::IsNullOrEmpty($transcriptPath) -or -not (Test-Path $transcriptPath)) {
        return ""
    }

    try {
        # 读取 transcript 文件（JSONL 格式），找到最后一个 user_message
        # 用户消息格式: {"message":{"content":[{"type":"user_message","text":"..."}]}}
        $lines = Get-Content $transcriptPath -Raw -Encoding UTF8
        $lines = $lines -split '\r?\n' | Where-Object { $_ -match '"type":"user_message"' }

        if ($lines.Count -gt 0) {
            $lastLine = $lines[-1]
            # 提取 text 字段
            if ($lastLine -match '"text":"(([^"]|\\")*)"') {
                $text = $Matches[1] -replace '\\"', '"' -replace '\\n', ' ' -replace '\\t', ' '
                # 限制长度为 100 字符
                if ($text.Length -gt 100) {
                    $text = $text.Substring(0, 100) + "..."
                }
                return $text
            }
        }
    } catch {
        # 忽略错误
    }

    return ""
}

# 构建通知内容
function Build-NotificationContent {
    $title = "Claude Code"
    $message = "会话已完成"

    # 如果有 SessionId，用作对话名称
    if ([string]::IsNullOrEmpty($SessionId) -eq $false) {
        $sessionName = $SessionId.Substring(0, [Math]::Min(8, $SessionId.Length))
        $title = "$title - [$sessionName]"
    }

    # 根据原因设置消息
    if ([string]::IsNullOrEmpty($Reason) -eq $false) {
        switch -Regex ($Reason) {
            "^(user_requested|User requested)$" {
                $message = "您手动结束了会话"
            }
            "^(timeout|Timeout)$" {
                $message = "会话超时结束"
            }
            "^(error|Error)$" {
                $message = "会话因错误结束"
            }
            default {
                $message = "会话已完成"
            }
        }
    }

    # 如果有最后一条用户消息，添加到消息中
    $lastMessage = Get-LastUserMessage $TranscriptPath
    if ([string]::IsNullOrEmpty($lastMessage) -eq $false) {
        $message = "$message - $lastMessage"
    }

    # 添加目录信息
    if ([string]::IsNullOrEmpty($Dir) -eq $false) {
        $parts = $Dir -split '[/\\]' | Where-Object { $_ }
        $shortDir = ($parts | Select-Object -Last 2) -join '/'
        $message = "$message - $shortDir"
    }

    return @($title, $message)
}

# 前台检测
if (-not ([System.Management.Automation.PSTypeName]'Win32').Type) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@
}

$foregroundWindow = [Win32]::GetForegroundWindow()
$foregroundPid = 0
[Win32]::GetWindowThreadProcessId($foregroundWindow, [ref]$foregroundPid) | Out-Null

$currentPid = $PID
$myTerminalPid = $null
for ($i = 0; $i -lt 20; $i++) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$currentPid" -ErrorAction SilentlyContinue
    if (-not $proc -or -not $proc.ParentProcessId) { break }
    $parentProc = Get-Process -Id $proc.ParentProcessId -ErrorAction SilentlyContinue
    if ($parentProc -and $parentProc.MainWindowHandle -ne [IntPtr]::Zero) {
        $myTerminalPid = $parentProc.Id
        break
    }
    $currentPid = $proc.ParentProcessId
}

$shouldNotify = $alwaysNotify -or ($foregroundPid -ne $myTerminalPid)

if ($shouldNotify) {
    # 构建通知内容
    $notification = Build-NotificationContent
    $Title = $notification[0]
    $Message = $notification[1]

    # 发送 Bark 通知
    if ($barkUrl) {
        try {
            $encodedTitle = [System.Uri]::EscapeDataString($Title)
            $encodedMessage = [System.Uri]::EscapeDataString($Message)
            $barkFullUrl = "$barkUrl/$encodedTitle/$encodedMessage"
            Invoke-RestMethod -Uri $barkFullUrl -Method Get -TimeoutSec 5 | Out-Null
        } catch {
            # Bark 发送失败，静默忽略
        }
    }

    # 发送 Windows Toast 通知（除非 bark_only 为 true）
    if (-not $barkOnly) {
        try {
            # 加载 Windows Runtime 组件
            [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
            [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

            # 应用标识符（使用 PowerShell 的 AppUserModelId）
            $AppId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'

            # 创建 Toast XML 模板
            # 构建 launch 参数和 action 参数，包含 SessionId（如果有）
            if ($SessionId) {
                $launchAttr = ' launch="{0}?session={1}"' -f $ActivateUrl, $SessionId
                $actionArgs = '{0}?session={1}' -f $ActivateUrl, $SessionId
            } else {
                $launchAttr = ' launch="{0}"' -f $ActivateUrl
                $actionArgs = $ActivateUrl
            }

            $ToastXml = @"
<toast$launchAttr>
    <visual>
        <binding template="ToastGeneric">
            <text>$([System.Security.SecurityElement]::Escape($Title))</text>
            <text>$([System.Security.SecurityElement]::Escape($Message))</text>
        </binding>
    </visual>
    <audio silent="true"/>
    <actions>
        <action content="打开会话" activationType="protocol" arguments="$actionArgs"/>
    </actions>
</toast>
"@

            # 加载 XML
            $XmlDoc = New-Object Windows.Data.Xml.Dom.XmlDocument
            $XmlDoc.LoadXml($ToastXml)

            # 创建并显示通知
            $Toast = [Windows.UI.Notifications.ToastNotification]::new($XmlDoc)
            $Toast.Tag = "ClaudeCode"
            $Toast.Group = "ClaudeCode"

            # 点击激活由 claude:// 协议处理程序（ClaudeProtocolHandler.exe）负责，无需 PowerShell 事件注册

            $Notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($AppId)
            $Notifier.Show($Toast)
        } catch {
            # Toast 通知失败，回退到 BalloonTip
            try {
                Add-Type -AssemblyName System.Windows.Forms
                $notify = New-Object System.Windows.Forms.NotifyIcon
                $notify.Icon = [System.Drawing.SystemIcons]::Information
                $notify.BalloonTipTitle = $Title
                $notify.BalloonTipText = $Message
                $notify.Visible = $true
                $notify.ShowBalloonTip(5000)
                # 不使用 Start-Sleep，让通知异步显示
                $notify.Dispose()
            } catch {
                # 完全失败，静默忽略
            }
        }
    }
}
