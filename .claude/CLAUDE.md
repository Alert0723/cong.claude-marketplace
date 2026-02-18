## 通知功能配置

### 当前配置
* 使用 Windows 系统通知
* Bark 推送：未配置（如需配置，请更新 `.claude/cong.claude-marketplace.local.md` 中的 `bark_url`）

### 主动通知场景
AI 应该在以下场景主动发送通知：
1. **长时间任务完成** - 构建、测试、部署等耗时任务完成时
2. **需要用户确认** - 重要决策或需要用户介入时
3. **重要里程碑** - 代码审查完成、PR 创建成功等
4. **错误警报** - 构建失败、测试未通过等异常情况

### 发送通知方法
使用 Bash 工具调用 notify.ps1 脚本：

```powershell
# 系统通知
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\conghuang\.claude\plugins\cache\cong-claude-marketplace\notification-windows\1.2.6/skills/notification-config/scripts/notify.ps1" -Title "Claude Code" -Message "任务完成"
```

### 使用原则
* 在用户明确要求通知时发送
* 完成重要任务后主动发送（如代码审查、PR创建、长时间构建等）
* 相关任务使用相同的标题进行分组

## claude-hud 插件

### 功能概述
claude-hud 是一个实时状态行 HUD 插件，显示以下信息：
* 上下文使用情况（令牌用量）
* 工具活动状态
* 运行中的 Agent 状态
* 待办事项进度

### 安装与配置
1. 插件已集成到市场，可通过 `/plugin install claude-hud` 安装
2. 安装后运行 `/claude-hud:setup` 配置状态行
3. 使用 `/claude-hud:configure` 自定义显示选项

### 显示内容
默认显示两行：
```
[Opus | Max] │ my-project git:(main*)
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
```

可选显示行（通过配置启用）：
* 工具活动行
* Agent 状态行
* 待办事项进度行
* 环境配置计数行
