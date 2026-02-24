# Knowledge Plugin

选择性知识索引系统 - 跨会话知识管理与按需检索

## 功能

- 自动检测代码变更
- 分析变更重要程度
- 区分用户级/项目级知识
- 按需检索，低 token 消耗
- 相似知识检测与合并

## 安装

```bash
/plugin install knowledge@cong.claude-marketplace
```

## 配置

首次安装后运行：

```bash
/knowledge:setup
```

配置选项：
- `autoStart`: 是否自动检测变更
- `confirmBeforeLearn`: 学习前是否确认

## 使用

### 查看待学习知识

```bash
/knowledge
```

### 搜索知识库

```bash
/knowledge:search <query>
```

### 查看待定队列

```bash
/knowledge:pending
```

### 查看状态

```bash
/knowledge:status
```

## 目录结构

```
~/.claude/knowledge/      # 用户级知识
<project>/.claude/knowledge/  # 项目级知识
```
