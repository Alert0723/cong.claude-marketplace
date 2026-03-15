# Safe Bash Hook

安全 Bash Hook - 只读命令自动放行，三层防护机制保护您的系统安全。

## 功能特性

- **只读命令自动放行** - 无需确认即可执行安全命令
- **三层防护机制** - 危险模式检测、黑名单拦截、白名单放行
- **智能判断** - 自动识别命令危险程度

## 安装

```bash
claude plugin install safe-bash
```

## 工作原理

### 第一层：危险模式检测
检测命令是否包含危险标志：
- `--force`, `-f` (强制操作)
- `--yes`, `-y` (自动确认)
- `--dangerously-disable-sandbox` (禁用沙盒)
- `--no-verify` (跳过验证)
- `--skip-hooks` (跳过钩子)
- `--hard` (硬重置)
- `--recursive`, `-r` (递归删除)
- `rm` (删除命令)
- `>` (输出重定向覆盖文件)
- `>/dev/null` (丢弃错误/输出)

### 第二层：黑名单拦截
阻止已知的危险命令：
- **文件删除**：`rm`, `rmdir`, `shred`, `srm`
- **文件修改**：`touch`, `truncate`, `chmod +w`, `chown`
- **数据库破坏**：`DROP`, `DELETE`, `TRUNCATE`
- **Git 危险操作**：`git reset --hard`, `git clean -fd`, `git branch -D`
- **系统修改**：`systemctl stop`, `kill -9`

### 第三层：白名单放行
以下只读命令会自动放行，无需确认：
- **查看文件**：`cat`, `head`, `tail`, `less`, `more`, `bat`, `grep`, `rg`, `find` (不含 -delete)
- **查看目录**：`ls`, `ll`, `l`, `dir`, `tree` (不含删除参数)
- **Git 查看**：`git status`, `git log`, `git show`, `git diff`, `git branch` (不含 -D)
- **信息查看**：`echo`, `pwd`, `whoami`, `which`, `type`, `command -v`
- **测试命令**：`test`, `[`, `[[`
- **网络查看**：`curl` (仅 GET 请求), `wget` (仅查看标志)
- **进程查看**：`ps`, `top`, `htop`, `pgrep`
- **端口查看**：`netstat`, `lsof`, `ss`

## 使用示例

### 自动放行的命令（无需确认）
```bash
# 查看文件
cat package.json
grep -r "TODO" src/

# 查看目录
ls -la
find src -name "*.ts"

# Git 查看
git status
git log --oneline

# 系统信息
pwd
whoami
```

### 需要确认的命令
```bash
# 危险标志
rm -rf node_modules
git push --force

# 黑名单命令
touch test.txt
chmod +w script.sh
```

## 配置

插件自动工作，无需额外配置。如需自定义行为，可以编辑 `hooks/hooks.json` 文件。

## 注意事项

- Hook 会在 Claude Code 启动时加载，修改配置后需要重启
- 在 `ask` 模式下工作最佳，其他模式可能表现不同
- 建议配合其他安全措施一起使用

## 许可证

MIT
