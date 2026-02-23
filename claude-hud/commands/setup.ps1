# claude-hud statusline command script
# This script dynamically finds and runs the latest installed version of the claude-hud plugin

# Find the latest installed version of claude-hud
$pluginBasePath = "$env:USERPROFILE\.claude\plugins\cache\cong-claude-marketplace\claude-hud"
$latestVersion = Get-ChildItem -Path $pluginBasePath -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $latestVersion) {
    Write-Error "claude-hud plugin not found at $pluginBasePath"
    exit 1
}

# Find runtime (prefer bun, fallback to node)
$runtime = if (Get-Command bun -ErrorAction SilentlyContinue) {
    (Get-Command bun).Source
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
    (Get-Command node).Source
} else {
    Write-Error "Neither bun nor node found. Please install Node.js or Bun."
    exit 1
}

# Determine source file (bun uses src/index.ts, node uses dist/index.js)
$runtimeName = Split-Path -Leaf $runtime
if ($runtimeName -like "bun*") {
    $sourceFile = "src\index.ts"
} else {
    $sourceFile = "dist\index.js"
}

$pluginPath = Join-Path $latestVersion.FullName $sourceFile

& $runtime $pluginPath
