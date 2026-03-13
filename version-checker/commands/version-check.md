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

### 2. 获取版本信息

使用 `./get-versions.sh` 获取版本信息，输出格式为：
```
current_version|stable_version|latest_version|latest_version_type
```

- `current_version`: 当前安装的版本
- `stable_version`: 最新稳定版
- `latest_version`: 最新版本（可能是稳定版或测试版）
- `latest_version_type`: 版本类型（stable/beta/rc/alpha/nightly/next/other）

### 3. 检查配置

读取配置文件 `.claude/version-checker.local.md`，检查 `check_beta` 设置：
- 如果 `check_beta: false` 且 `latest_version_type` 不是 `stable`：只提示稳定版更新
- 如果 `check_beta: true` 或 `latest_version_type` 是 `stable`：正常显示最新版本

### 4. 对比版本

- 如果当前版本等于最新版本：显示"当前已是最新版本"，不进行后续操作
- 如果当前版本低于最新版本：继续获取更新差异
- 如果有可用更新但只检查稳定版：显示稳定版更新信息

### 5. 获取更新差异

使用以下命令获取更新日志：

```bash
# 从 GitHub releases API 获取
curl -s "https://api.github.com/repos/anthropics/claude-code/releases" | ...
```

或使用 WebSearch 获取更新日志信息。

格式化更新差异：每个功能用一句话高度总结。

### 5. 显示更新信息

显示格式示例：

**稳定版更新：**

```
发现新版本！

当前版本: 2.1.50
最新稳定版: 2.1.74 [稳定版]

主要更新：
- 添加 /context 命令的可操作建议
- 修复内存泄漏问题
- 修复 MCP OAuth 认证问题
- 修复语音模式问题
- 修复 RTL 文本渲染问题
```

**测试版更新：**

```
发现新版本！

当前版本: 2.1.74
最新稳定版: 2.1.74 [稳定版]
最新版本: 2.2.0-beta.1 [测试版]

主要更新（测试版）：
- 新增实验性功能 X
- 性能优化改进
- 已知问题：功能 Y 可能不稳定
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
