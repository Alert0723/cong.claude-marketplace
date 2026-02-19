# Claude Protocol Handler 安装脚本
param([switch]$Uninstall)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CsFile = Join-Path $ScriptDir "ClaudeProtocolHandler.cs"
$OutputExe = Join-Path $ScriptDir "ClaudeProtocolHandler.exe"

if ($Uninstall) {
    # 卸载模式 - 只需运行已编译的程序
    if (Test-Path $OutputExe) {
        & $OutputExe --uninstall
        Write-Host "Protocol handler uninstalled."
    } else {
        Write-Warning "Protocol handler executable not found. Nothing to uninstall."
    }
    exit 0
}

# 编译 C# 程序
Write-Host "Compiling ClaudeProtocolHandler..."

$compilerArgs = @(
    "/target:winexe",
    "/out:$OutputExe",
    "/platform:anycpu",
    "/optimize",
    "/nologo",
    $CsFile
)

$compilerPath = "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $compilerPath)) {
    $compilerPath = "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

if (-not (Test-Path $compilerPath)) {
    throw "C# compiler not found. Please install .NET Framework."
}

& $compilerPath $compilerArgs 2>&1

if ($LASTEXITCODE -ne 0) {
    throw "Compilation failed with exit code $LASTEXITCODE"
}

if (-not (Test-Path $OutputExe)) {
    throw "Compilation failed: executable not created"
}

Write-Host "Compilation successful."

# 注册协议处理程序
Write-Host "Installing protocol handler..."
& $OutputExe --install

if ($LASTEXITCODE -ne 0) {
    throw "Protocol handler installation failed"
}

Write-Host ""
Write-Host "=================================================="
Write-Host "Claude Protocol Handler installed successfully!"
Write-Host "=================================================="
Write-Host ""
Write-Host "You can now click on notifications to activate them."
Write-Host "Note: You may need to restart your browser or application."
Write-Host ""
Write-Host "To uninstall, run:"
Write-Host "  powershell -File install-protocol-handler.ps1 -Uninstall"
