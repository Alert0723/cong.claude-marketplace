---
description: 检查 Claude Code 版本更新，显示当前版本和最新版本，获取更新差异，询问是否更新
argument-hint: [--version <版本号>] 检查版本或更新到指定版本
allowed-tools: ["Bash", "AskUserQuestion", "WebSearch"]
---

# Version Check Command

检查 Claude Code 版本更新，获取版本间的更新差异，并提供更新选项。

## 执行步骤

### 1. 获取当前版本

使用 `claude --version` 获取当前安装的版本号。

### 2. 获取最新版本

使用 `npm view @anthropic-ai/claude-code version` 获取最新可用版本。

### 3. 对比版本

- 如果当前版本等于最新版本：显示"当前已是最新版本"，不进行后续操作
- 如果当前版本低于最新版本：继续获取更新差异

### 4. 获取更新差异

使用以下命令获取更新日志：

```bash
# 从 GitHub releases API 获取
curl -s "https://api.github.com/repos/anthropics/claude-code/releases" | ...
```

或使用 WebSearch 获取更新日志信息。

格式化更新差异：每个功能用一句话高度总结。

### 5. 显示更新信息

显示格式示例：

```
发现新版本！

当前版本: 2.1.50
最新版本: 2.1.74

主要更新：
- 添加 /context 命令的可操作建议
- 修复内存泄漏问题
- 修复 MCP OAuth 认证问题
- 修复语音模式问题
- 修复 RTL 文本渲染问题
```

### 6. 询问更新意向

使用 `AskUserQuestion` 询问用户：

- 更新到最新版本
- 更新到指定版本
- 暂不更新

如果用户选择更新到指定版本，需要询问版本号。

### 7. 执行更新

如果用户确认更新，使用以下命令：

```bash
npm install -g @anthropic-ai/claude-code@<版本号>
```

更新完成后验证新版本：`claude --version`

## 注意事项

- 如果用户提供了 `--version` 参数，跳过检查直接询问是否更新到指定版本
- 如果当前版本等于最新版本，不做任何提示
- 更新需要用户确认后才执行
