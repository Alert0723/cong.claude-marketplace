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
