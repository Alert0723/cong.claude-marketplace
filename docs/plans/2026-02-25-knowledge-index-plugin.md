# Knowledge Index Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a selective knowledge index plugin for Claude Code Marketplace that enables cross-session knowledge management with on-demand retrieval and minimal token consumption.

**Architecture:** A plugin consisting of commands, skills, hooks, and scripts that detect code changes, analyze importance, manage knowledge states (pending/classified/learned), and provide on-demand retrieval. Knowledge is stored in user-level (~/.claude/knowledge) and project-level (.claude/knowledge) directories.

**Tech Stack:** Node.js scripts for detection/analysis/storage, Claude Code plugin API (Commands, Skills, Hooks), JSON for knowledge storage and configuration.

---

## Task 1: Create Plugin Structure

**Files:**
- Create: `knowledge/.claude-plugin/plugin.json`
- Create: `knowledge/CLAUDE.md`

**Step 1: Create plugin.json**

```json
{
  "name": "knowledge",
  "description": "选择性知识索引系统 - 跨会话知识管理与按需检索",
  "version": "0.1.0",
  "author": {
    "name": "conghuang"
  }
}
```

**Step 2: Create CLAUDE.md**

```markdown
# Knowledge Plugin

选择性知识索引系统，实现跨会话知识管理和按需检索。

## 功能特性

- 变更检测与重要度分析
- 知识状态管理（pending/classified/learned）
- 用户级/项目级知识分类
- 相似知识检测与合并
- 按需检索，不自动加载全部知识
- 低 token 消耗
```

**Step 3: Commit**

```bash
cd D:/Workspace/AI/cong.claude-marketplace
git add knowledge/.claude-plugin/plugin.json knowledge/CLAUDE.md
git commit -m "feat(knowledge): create plugin structure"
```

---

## Task 2: Create Configuration Schema

**Files:**
- Create: `knowledge/config/schema.json`
- Create: `knowledge/scripts/config.js`

**Step 1: Write the test for config loading**

```javascript
// knowledge/scripts/config.test.js
const fs = require('fs');
const path = require('path');

describe('Config', () => {
  const configPath = path.join(__dirname, '../config.json');

  beforeEach(() => {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  test('should load default config when file does not exist', () => {
    const config = require('./config.js').load();
    expect(config).toEqual({
      autoStart: false,
      confirmBeforeLearn: true,
      userKnowledgeDir: path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'knowledge'),
      projectKnowledgeDir: '.claude/knowledge'
    });
  });

  test('should load custom config from file', () => {
    const customConfig = {
      autoStart: true,
      confirmBeforeLearn: false
    };
    fs.writeFileSync(configPath, JSON.stringify(customConfig, null, 2));

    const config = require('./config.js').load();
    expect(config.autoStart).toBe(true);
    expect(config.confirmBeforeLearn).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test config.test.js`
Expected: FAIL with "Cannot find module './config.js'"

**Step 3: Write minimal implementation**

```javascript
// knowledge/scripts/config.js
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_CONFIG = {
  autoStart: false,
  confirmBeforeLearn: true,
  userKnowledgeDir: path.join(os.homedir(), '.claude', 'knowledge'),
  projectKnowledgeDir: '.claude/knowledge'
};

function getConfigPath() {
  return path.join(__dirname, '..', 'config.json');
}

function load() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(fileContent) };
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error.message);
    return { ...DEFAULT_CONFIG };
  }
}

function save(config) {
  const configPath = getConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = { load, save, DEFAULT_CONFIG };
```

**Step 4: Run test to verify it passes**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test config.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add knowledge/scripts/config.js knowledge/scripts/config.test.js
git commit -m "feat(knowledge): add configuration management"
```

---

## Task 3: Create Knowledge Storage Manager

**Files:**
- Create: `knowledge/scripts/storage.js`
- Create: `knowledge/scripts/storage.test.js`

**Step 1: Write the test for knowledge storage**

```javascript
// knowledge/scripts/storage.test.js
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Storage', () => {
  const testDir = path.join(os.tmpdir(), 'knowledge-test-' + Date.now());
  const storage = require('./storage.js');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('should save knowledge to file', () => {
    const knowledge = {
      id: 'test-id',
      summary: 'Test knowledge',
      importance: 0.8,
      level: 'project',
      filePath: 'src/test.ts',
      timestamp: new Date().toISOString()
    };

    storage.saveKnowledge(knowledge, testDir);

    const filePath = path.join(testDir, 'test-id.json');
    expect(fs.existsSync(filePath)).toBe(true);

    const loaded = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(loaded.summary).toBe('Test knowledge');
  });

  test('should load all knowledge from directory', () => {
    const knowledge1 = { id: 'id-1', summary: 'Knowledge 1', importance: 0.5 };
    const knowledge2 = { id: 'id-2', summary: 'Knowledge 2', importance: 0.7 };

    storage.saveKnowledge(knowledge1, testDir);
    storage.saveKnowledge(knowledge2, testDir);

    const all = storage.loadAllKnowledge(testDir);
    expect(all).toHaveLength(2);
  });

  test('should search knowledge by query', () => {
    const knowledge1 = { id: 'id-1', summary: 'Authentication API', importance: 0.8 };
    const knowledge2 = { id: 'id-2', summary: 'Database connection', importance: 0.6 };

    storage.saveKnowledge(knowledge1, testDir);
    storage.saveKnowledge(knowledge2, testDir);

    const results = storage.searchKnowledge(testDir, 'auth');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('id-1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test storage.test.js`
Expected: FAIL with "Cannot find module './storage.js'"

**Step 3: Write minimal implementation**

```javascript
// knowledge/scripts/storage.js
const fs = require('fs');
const path = require('path');

function saveKnowledge(knowledge, dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${knowledge.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(knowledge, null, 2));
}

function loadAllKnowledge(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const knowledge = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      knowledge.push(JSON.parse(content));
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error.message);
    }
  }

  return knowledge.sort((a, b) => b.importance - a.importance);
}

function searchKnowledge(dir, query) {
  const all = loadAllKnowledge(dir);
  const queryLower = query.toLowerCase();

  return all.filter(k =>
    k.summary.toLowerCase().includes(queryLower) ||
    (k.filePath && k.filePath.toLowerCase().includes(queryLower))
  );
}

function deleteKnowledge(id, dir) {
  const filePath = path.join(dir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

module.exports = {
  saveKnowledge,
  loadAllKnowledge,
  searchKnowledge,
  deleteKnowledge
};
```

**Step 4: Run test to verify it passes**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test storage.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add knowledge/scripts/storage.js knowledge/scripts/storage.test.js
git commit -m "feat(knowledge): add knowledge storage manager"
```

---

## Task 4: Create Pending Queue Manager

**Files:**
- Create: `knowledge/scripts/pending-queue.js`
- Create: `knowledge/scripts/pending-queue.test.js`

**Step 1: Write the test for pending queue**

```javascript
// knowledge/scripts/pending-queue.test.js
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('PendingQueue', () => {
  const testDir = path.join(os.tmpdir(), 'pending-test-' + Date.now());
  const queue = require('./pending-queue.js');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('should add item to queue', () => {
    const item = {
      id: 'item-1',
      summary: 'Pending item',
      importance: 0.7,
      status: 'pending'
    };

    queue.add(item, testDir);

    const all = queue.getAll(testDir);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('item-1');
  });

  test('should update item status', () => {
    const item = { id: 'item-1', summary: 'Test', importance: 0.5, status: 'pending' };
    queue.add(item, testDir);

    queue.updateStatus('item-1', 'classified', testDir);

    const updated = queue.getAll(testDir);
    expect(updated[0].status).toBe('classified');
  });

  test('should filter items by status', () => {
    queue.add({ id: 'item-1', summary: 'A', importance: 0.5, status: 'pending' }, testDir);
    queue.add({ id: 'item-2', summary: 'B', importance: 0.7, status: 'classified' }, testDir);

    const pending = queue.getByStatus('pending', testDir);
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('item-1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test pending-queue.test.js`
Expected: FAIL with "Cannot find module './pending-queue.js'"

**Step 3: Write minimal implementation**

```javascript
// knowledge/scripts/pending-queue.js
const fs = require('fs');
const path = require('path');

function getQueuePath(dir) {
  return path.join(dir, 'pending-queue.json');
}

function add(item, dir) {
  const queuePath = getQueuePath(dir);
  let queue = [];

  if (fs.existsSync(queuePath)) {
    queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
  }

  queue.push({
    ...item,
    addedAt: new Date().toISOString()
  });

  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
}

function getAll(dir) {
  const queuePath = getQueuePath(dir);
  if (!fs.existsSync(queuePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
}

function updateStatus(id, status, dir) {
  const queue = getAll(dir);
  const index = queue.findIndex(item => item.id === id);

  if (index !== -1) {
    queue[index].status = status;
    queue[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(getQueuePath(dir), JSON.stringify(queue, null, 2));
  }
}

function getByStatus(status, dir) {
  return getAll(dir).filter(item => item.status === status);
}

function remove(id, dir) {
  const queue = getAll(dir);
  const filtered = queue.filter(item => item.id !== id);
  fs.writeFileSync(getQueuePath(dir), JSON.stringify(filtered, null, 2));
}

module.exports = { add, getAll, updateStatus, getByStatus, remove };
```

**Step 4: Run test to verify it passes**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test pending-queue.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add knowledge/scripts/pending-queue.js knowledge/scripts/pending-queue.test.js
git commit -m "feat(knowledge): add pending queue manager"
```

---

## Task 5: Create Change Detector

**Files:**
- Create: `knowledge/scripts/detector.js`
- Create: `knowledge/scripts/detector.test.js`

**Step 1: Write the test for change detection**

```javascript
// knowledge/scripts/detector.test.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('ChangeDetector', () => {
  const testDir = path.join(os.tmpdir(), 'detector-test-' + Date.now());
  const detector = require('./detector.js');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
    execSync('git init', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: testDir, stdio: 'ignore' });

    // Create initial files
    fs.writeFileSync(path.join(testDir, 'src', 'test.ts'), 'initial content');
    execSync('git add . && git commit -m "initial"', { cwd: testDir, stdio: 'ignore' });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('should detect changes since last commit', () => {
    fs.writeFileSync(path.join(testDir, 'src', 'test.ts'), 'modified content');

    const changes = detector.detectChanges(testDir);
    expect(changes).toHaveLength(1);
    expect(changes[0].filePath).toBe('src/test.ts');
    expect(changes[0].type).toBe('modified');
  });

  test('should ignore node_modules directory', () => {
    fs.mkdirSync(path.join(testDir, 'node_modules'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'node_modules', 'test.js'), 'content');

    const changes = detector.detectChanges(testDir);
    expect(changes).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test detector.test.js`
Expected: FAIL with "Cannot find module './detector.js'"

**Step 3: Write minimal implementation**

```javascript
// knowledge/scripts/detector.js
const { execSync } = require('child_process');
const path = require('path');

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.claude'
];

function detectChanges(baseDir) {
  try {
    // Get changed files since last commit
    const output = execSync('git diff --name-status HEAD', {
      cwd: baseDir,
      encoding: 'utf-8'
    });

    if (!output.trim()) {
      return [];
    }

    const lines = output.trim().split('\n');
    const changes = [];

    for (const line of lines) {
      const [status, filePath] = line.split('\t');
      const isIgnored = IGNORED_PATHS.some(ignored =>
        filePath.startsWith(ignored) || filePath.includes(path.sep + ignored)
      );

      if (!isIgnored) {
        const type = status.startsWith('A') ? 'added' :
                     status.startsWith('D') ? 'deleted' : 'modified';

        changes.push({
          filePath,
          type,
          status
        });
      }
    }

    return changes;
  } catch (error) {
    console.warn('Failed to detect changes:', error.message);
    return [];
  }
}

module.exports = { detectChanges, IGNORED_PATHS };
```

**Step 4: Run test to verify it passes**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test detector.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add knowledge/scripts/detector.js knowledge/scripts/detector.test.js
git commit -m "feat(knowledge): add change detector"
```

---

## Task 6: Create Importance Analyzer

**Files:**
- Create: `knowledge/scripts/analyzer.js`
- Create: `knowledge/scripts/analyzer.test.js`

**Step 1: Write the test for importance analysis**

```javascript
// knowledge/scripts/analyzer.test.js
const analyzer = require('./analyzer');

describe('Analyzer', () => {
  test('should calculate importance based on file type', () => {
    const tsFile = { filePath: 'src/api/auth.ts', type: 'modified' };
    const tsResult = analyzer.analyzeImportance(tsFile);

    expect(tsResult.importance).toBeGreaterThan(0);
    expect(tsResult.summary).toBeTruthy();
  });

  test('should detect API files as more important', () => {
    const apiFile = { filePath: 'src/api/index.ts', type: 'modified' };
    const configFile = { filePath: 'config.json', type: 'modified' };

    const apiResult = analyzer.analyzeImportance(apiFile);
    const configResult = analyzer.analyzeImportance(configFile);

    expect(apiResult.importance).toBeGreaterThan(configResult.importance);
  });

  test('should classify knowledge level (user/project)', () => {
    const projectFile = { filePath: 'src/components/Button.tsx', type: 'added' };
    const userFile = { filePath: '.claude/CLAUDE.md', type: 'modified' };

    const projectResult = analyzer.analyzeImportance(projectFile);
    const userResult = analyzer.analyzeImportance(userFile);

    expect(projectResult.level).toBe('project');
    expect(userResult.level).toBe('user');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test analyzer.test.js`
Expected: FAIL with "Cannot find module './analyzer.js'"

**Step 3: Write minimal implementation**

```javascript
// knowledge/scripts/analyzer.js
const path = require('path');

const FILE_IMPORTANCE = {
  // Core application files
  '.ts': 0.8,
  '.tsx': 0.75,
  '.js': 0.7,
  '.jsx': 0.65,
  // Config files
  '.json': 0.5,
  '.yaml': 0.5,
  '.yml': 0.5,
  '.toml': 0.5,
  // Documentation
  '.md': 0.3,
  '.txt': 0.2,
  // Styles
  '.css': 0.4,
  '.scss': 0.4,
  '.less': 0.4
};

const PATH_BONUS = {
  'api': 0.15,
  'src': 0.1,
  'lib': 0.1,
  'components': 0.05,
  'hooks': 0.1
};

const USER_LEVEL_PATHS = [
  '.claude/',
  'claude-',
  'readme',
  'contributing'
];

function analyzeImportance(change) {
  const ext = path.extname(change.filePath);
  const dirName = path.dirname(change.filePath).toLowerCase();

  // Base importance from file type
  let importance = FILE_IMPORTANCE[ext] || 0.3;

  // Bonus for important directories
  for (const [key, bonus] of Object.entries(PATH_BONUS)) {
    if (dirName.includes(key)) {
      importance += bonus;
    }
  }

  // Type modifier
  if (change.type === 'added') {
    importance += 0.1;
  }

  // Clamp to 0-1
  importance = Math.max(0, Math.min(1, importance));

  // Determine level (user vs project)
  const isUserLevel = USER_LEVEL_PATHS.some(p =>
    change.filePath.toLowerCase().includes(p)
  );
  const level = isUserLevel ? 'user' : 'project';

  // Generate summary
  const fileName = path.basename(change.filePath);
  const typeLabels = {
    added: '新增',
    modified: '修改',
    deleted: '删除'
  };
  const summary = `${typeLabels[change.type]} ${fileName}`;

  return {
    importance: Number(importance.toFixed(2)),
    level,
    summary,
    filePath: change.filePath,
    changeType: change.type,
    timestamp: new Date().toISOString()
  };
}

function detectSimilarity(newKnowledge, existingKnowledge) {
  // Path similarity
  const pathMatch = newKnowledge.filePath === existingKnowledge.filePath;

  // Summary similarity (simple word overlap)
  const newWords = newKnowledge.summary.toLowerCase().split(/\s+/);
  const existingWords = existingKnowledge.summary.toLowerCase().split(/\s+/);
  const commonWords = newWords.filter(w => existingWords.includes(w));
  const similarity = commonWords.length / Math.max(newWords.length, existingWords.length);

  return {
    isSimilar: pathMatch || similarity > 0.5,
    score: similarity,
    reason: pathMatch ? 'Same file' : 'Content similarity'
  };
}

module.exports = { analyzeImportance, detectSimilarity };
```

**Step 4: Run test to verify it passes**

Run: `cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts && node --test analyzer.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add knowledge/scripts/analyzer.js knowledge/scripts/analyzer.test.js
git commit -m "feat(knowledge): add importance analyzer"
```

---

## Task 7: Create Main Knowledge Command

**Files:**
- Create: `knowledge/commands/knowledge.md`

**Step 1: Write the command markdown file**

```markdown
---
name: knowledge
description: |
  This command manages the knowledge index system - viewing pending knowledge,
  classifying by user/project level, and learning knowledge into the database.
---

# Knowledge Management

Use this command to manage the selective knowledge index system.

## When to use

- User types `/knowledge`
- User wants to see pending knowledge to learn
- User wants to classify or learn knowledge

## Process

### 1. Check configuration

First, check if the plugin is configured:

```bash
# Read config file
Read: ${CLAUDE_PLUGIN_ROOT}/config.json
```

If file doesn't exist, guide user to setup:
```
插件未配置，请先运行 /knowledge:setup 进行初始配置。
```

### 2. Detect changes

Run the change detector:

```bash
cd ${CURRENT_WORKING_DIR}
node ${CLAUDE_PLUGIN_ROOT}/scripts/detector.js
```

If no changes, show status:
```
✓ 没有检测到新的变更
```

### 3. Analyze and display knowledge

For each change, analyze importance and display:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/analyzer.js --file <path> --type <type>
```

Display format:
```
📋 待学习知识 (共 N 条)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 [重要度: 0.9] src/api/auth.ts
   └─ 变更类型: 新增功能
   └─ 说明: 实现JWT认证，包含登录/刷新/登出

   [学习] [用户级] [项目级] [跳过]
```

### 4. Check for similar knowledge

For each new knowledge, check for similar existing knowledge:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --search <query> --dir <dir>
```

If similar knowledge found, display:
```
⚠️  检测到相似知识
   [新建知识] [合并到现有] [跳过] [查看差异]
```

### 5. Get user action

Use AskUserQuestion for each knowledge item:

Options:
- "学习" - Learn as project-level knowledge
- "用户级" - Learn as user-level knowledge
- "跳过" - Skip this knowledge
- "查看差异" - Show diff with similar knowledge (if applicable)

### 6. Process user action

- **Learn**: Save to storage with appropriate level
- **Skip**: Mark as skipped in pending queue
- **Merge**: Update existing knowledge with new content

### 7. Confirm completion

After processing all items:
```
✓ 完成！已处理 N 条知识
  - 学习: X 条
  - 跳过: Y 条
  - 合并: Z 条
```
```

**Step 2: Create the command directory**

```bash
mkdir -p D:/Workspace/AI/cong.claude-marketplace/knowledge/commands
```

**Step 3: Commit**

```bash
git add knowledge/commands/knowledge.md
git commit -m "feat(knowledge): add main knowledge command"
```

---

## Task 8: Create Setup Command

**Files:**
- Create: `knowledge/commands/setup.md`

**Step 1: Write the setup command file**

```markdown
---
name: knowledge:setup
description: |
  This command handles first-time plugin configuration, prompting user for
  storage paths and behavioral preferences.
---

# Knowledge Plugin Setup

First-time configuration for the knowledge index plugin.

## Process

### 1. Check if already configured

```bash
# Check if config exists
Read: ${CLAUDE_PLUGIN_ROOT}/config.json
```

If exists and not empty, show current config and ask if modify:

```
当前配置:
- 自动启动: <value>
- 学习前确认: <value>
- 用户知识目录: <value>
- 项目知识目录: <value>

是否修改配置？
```

### 2. Prompt for auto-start

```bash
AskUserQuestion:
  question: "是否在启动新对话时自动运行知识检测？"
  options:
    - "是，自动检测"
    - "否，手动触发"
```

### 3. Prompt for confirmation

```bash
AskUserQuestion:
  question: "学习知识前是否需要确认？"
  options:
    - "是，每次确认"
    - "否，自动学习"
```

### 4. Save configuration

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/config.js --save <config>
```

Write to: `${CLAUDE_PLUGIN_ROOT}/config.json`

### 5. Create directories

```bash
mkdir -p ~/.claude/knowledge
mkdir -p .claude/knowledge
```

### 6. Confirm completion

```
✓ 配置完成！

配置已保存到: ${CLAUDE_PLUGIN_ROOT}/config.json

知识目录:
- 用户级: ~/.claude/knowledge/
- 项目级: .claude/knowledge/

现在可以使用 /knowledge 命令开始学习知识了。
```
```

**Step 2: Commit**

```bash
git add knowledge/commands/setup.md
git commit -m "feat(knowledge): add setup command"
```

---

## Task 9: Create Search Command

**Files:**
- Create: `knowledge/commands/search.md`

**Step 1: Write the search command file**

```markdown
---
name: knowledge:search
description: |
  This command searches the knowledge base for relevant information based on
  the user's query. Supports keyword and semantic search.
---

# Knowledge Search

Search the knowledge base for relevant information.

## Parameters

- `query`: Search query (required)

## Process

### 1. Parse query

Extract the search query from the command arguments.

### 2. Search both knowledge bases

```bash
# Search user-level knowledge
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --search <query> --dir ~/.claude/knowledge

# Search project-level knowledge
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --search <query> --dir .claude/knowledge
```

### 3. Merge and rank results

Combine results from both knowledge bases and rank by importance.

### 4. Display results

```
🔍 搜索结果: "<query>"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟦 [用户级] API认证规范
   └─ 重要度: 0.9
   └─ 文件: src/api/auth.ts
   └─ 说明: JWT认证实现，包含登录/刷新/登出

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟩 [项目级] 数据库配置
   └─ 重要度: 0.6
   └─ 文件: config/database.json
   └─ 说明: PostgreSQL连接配置

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Handle no results

```
未找到相关知识。使用 /knowledge 命令学习新知识。
```
```

**Step 2: Commit**

```bash
git add knowledge/commands/search.md
git commit -m "feat(knowledge): add search command"
```

---

## Task 10: Create Pending Queue Command

**Files:**
- Create: `knowledge/commands/pending.md`

**Step 1: Write the pending command file**

```markdown
---
name: knowledge:pending
description: |
  This command shows the pending queue of knowledge items that haven't been
  classified or learned yet.
---

# Pending Knowledge Queue

View and manage the pending knowledge queue.

## Process

### 1. Load pending queue

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/pending-queue.js --list
```

### 2. Display pending items

```
⏳ 待定队列 (共 N 条)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 [重要度: 0.7] src/components/Button.tsx
   └─ 添加时间: 2026-02-25 14:30
   └─ 状态: pending

   [学习] [用户级] [项目级] [删除]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Handle empty queue

```
✓ 待定队列为空
```

### 4. Process user action

For each item, use AskUserQuestion to get user action.

Options:
- "学习" - Learn now
- "用户级" - Learn as user-level
- "项目级" - Learn as project-level
- "删除" - Remove from queue
```

**Step 2: Commit**

```bash
git add knowledge/commands/pending.md
git commit -m "feat(knowledge): add pending queue command"
```

---

## Task 11: Create Status Command

**Files:**
- Create: `knowledge/commands/status.md`

**Step 1: Write the status command file**

```markdown
---
name: knowledge:status
description: |
  This command shows statistics about the knowledge base - total knowledge,
  pending items, storage usage, etc.
---

# Knowledge Status

Display knowledge base statistics and status.

## Process

### 1. Load statistics

```bash
# Count learned knowledge
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --count --dir ~/.claude/knowledge
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --count --dir .claude/knowledge

# Count pending items
node ${CLAUDE_PLUGIN_ROOT}/scripts/pending-queue.js --count

# Get storage size
du -sh ~/.claude/knowledge
du -sh .claude/knowledge
```

### 2. Display status

```
📊 知识库状态

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用户级知识:
  - 总数: <count> 条
  - 存储: <size>

项目级知识:
  - 总数: <count> 条
  - 存储: <size>

待定队列:
  - 待处理: <count> 条

最近学习:
  - 文件: <filename>
  - 时间: <timestamp>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
```

**Step 2: Commit**

```bash
git add knowledge/commands/status.md
git commit -m "feat(knowledge): add status command"
```

---

## Task 12: Create Main Skill

**Files:**
- Create: `knowledge/skills/knowledge/SKILL.md`

**Step 1: Write the skill file**

```markdown
---
name: knowledge
description: |
  This skill should be used when the user asks about the knowledge system,
  wants to learn knowledge, search knowledge, or manage the knowledge base.
  Use when user mentions "knowledge", "learn", "记忆", or asks for project
  context that might be in the knowledge base.
---

# Knowledge System

The Knowledge System provides cross-session memory and on-demand knowledge retrieval.

## When to invoke

- User asks to "learn knowledge" or "学习知识"
- User searches for "something from previous sessions"
- User asks "what do you know about this project?"
- User mentions "记忆" (memory) related to code understanding
- User needs context for project-specific code/APIs

## Knowledge retrieval workflow

When user asks a question that might be answered from knowledge:

### 1. Check if knowledge exists

Search both user-level and project-level knowledge bases:

```bash
# Get query from user message
# Search for relevant knowledge
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --search "<query>" --dir ~/.claude/knowledge
node ${CLAUDE_PLUGIN_ROOT}/scripts/storage.js --search "<query>" --dir .claude/knowledge
```

### 2. Inject relevant knowledge

If relevant knowledge is found, inject it into the conversation context:

```
[相关知识]

🟦 用户级知识: <summary>
🟩 项目级知识: <summary>

---
```

### 3. Answer based on knowledge

Use the injected knowledge to provide a more informed response.

**Important:** Only retrieve knowledge when user explicitly asks or when the query clearly indicates need for project-specific information.

## User commands

- `/knowledge` - View and learn pending knowledge
- `/knowledge:setup` - First-time configuration
- `/knowledge:search <query>` - Search knowledge base
- `/knowledge:pending` - View pending queue
- `/knowledge:status` - View knowledge statistics

## Storage locations

- User-level: `~/.claude/knowledge/`
- Project-level: `.claude/knowledge/`

## Knowledge classification

- **User-level**: Cross-project patterns, coding standards, personal preferences
- **Project-level**: API design, architecture decisions, business logic
```

**Step 2: Create skill directory**

```bash
mkdir -p D:/Workspace/AI/cong.claude-marketplace/knowledge/skills/knowledge
```

**Step 3: Commit**

```bash
git add knowledge/skills/knowledge/SKILL.md
git commit -m "feat(knowledge): add main skill"
```

---

## Task 13: Create Hooks for Auto-start

**Files:**
- Create: `knowledge/hooks/hooks.json`

**Step 1: Write the hooks configuration**

```json
{
  "description": "Knowledge Index Plugin Hooks",
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-start.js"
          }
        ]
      }
    ]
  }
}
```

**Step 2: Create the hook script**

```javascript
// knowledge/scripts/hooks/session-start.js
const fs = require('fs');
const path = require('path');

function checkAutoStart() {
  const configPath = path.join(__dirname, '..', 'config.json');

  if (!fs.existsSync(configPath)) {
    return false; // Not configured yet
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config.autoStart === true;
  } catch (error) {
    console.warn('Failed to read config:', error.message);
    return false;
  }
}

if (checkAutoStart()) {
  console.log('[Knowledge] Auto-start enabled. Use /knowledge to learn changes.');
  // Knowledge detection will happen when user invokes /knowledge
}

module.exports = { checkAutoStart };
```

**Step 3: Create hooks directory**

```bash
mkdir -p D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts/hooks
```

**Step 4: Commit**

```bash
git add knowledge/hooks/hooks.json knowledge/scripts/hooks/session-start.js
git commit -m "feat(knowledge): add session start hook"
```

---

## Task 14: Update Marketplace README

**Files:**
- Modify: `README.md`

**Step 1: Update README to include knowledge plugin**

Add to the plugin list table:

```markdown
| 插件 | 平台 | 说明 |
|------|------|------|
| `notification-windows` | Windows | Windows 桌面通知（PowerShell） |
| `notification-unix` | macOS/Linux | Unix 桌面通知（Shell） |
| `claude-hud` | 全平台 | 实时状态行 HUD - 显示上下文用量、工具活动、Agent 状态等 |
| `claude-mem` | 全平台 | 持久化内存系统 - 跨会话上下文压缩与记忆 |
| `knowledge` | 全平台 | 选择性知识索引 - 跨会话知识管理与按需检索 |
| `pdf2skills` | 全平台 | PDF 转 Claude 技能 - 自动提取内容并生成技能目录 |
| `plugin-dev` | 全平台 | 插件开发工具包 - Hooks、MCP、Commands、Agents、Skills 开发指南 |
```

Add a new section after claude-mem:

```markdown
## 📚 knowledge

选择性知识索引系统，实现跨会话知识管理和按需检索。

### 安装

```bash
/plugin install knowledge@cong.claude-marketplace
```

### 首次配置

```bash
/knowledge:setup
```

### 功能特性

- **变更检测** - 自动检测代码变更
- **重要度分析** - 分析变更的重要程度（仅用于排序，不作为过滤阈值）
- **知识分类** - 区分用户级（跨项目）和项目级知识
- **按需检索** - 只在需要时检索知识，不自动加载全部
- **低 Token 消耗** - 极低消耗模式，按需触发

### 使用命令

| 命令 | 功能 |
|------|------|
| `/knowledge` | 查看待学习知识，进行分类 |
| `/knowledge:setup` | 首次安装配置 |
| `/knowledge:search <query>` | 搜索知识库 |
| `/knowledge:pending` | 查看待定队列 |
| `/knowledge:status` | 查看知识库统计 |

### 知识存储

- **用户级**: `~/.claude/knowledge/` - 跨项目通用知识
- **项目级**: `.claude/knowledge/` - 项目特定知识
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add knowledge plugin to README"
```

---

## Task 15: Create Plugin Documentation

**Files:**
- Create: `knowledge/README.md`

**Step 1: Write plugin README**

```markdown
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
```

**Step 2: Commit**

```bash
git add knowledge/README.md
git commit -m "docs(knowledge): add plugin README"
```

---

## Task 16: Final Testing

**Files:**
- None

**Step 1: Verify plugin structure**

```bash
# Check all required files exist
ls -la D:/Workspace/AI/cong.claude-marketplace/knowledge/
ls -la D:/Workspace/AI/cong.claude-marketplace/knowledge/.claude-plugin/
ls -la D:/Workspace/AI/cong.claude-marketplace/knowledge/commands/
ls -la D:/Workspace/AI/cong.claude-marketplace/knowledge/skills/
ls -la D:/Workspace/AI/cong.claude-marketplace/knowledge/hooks/
ls -la D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts/
```

**Step 2: Run all tests**

```bash
cd D:/Workspace/AI/cong.claude-marketplace/knowledge/scripts
node --test **/*.test.js
```

**Step 3: Commit**

```bash
git add .
git commit -m "test: complete plugin implementation"
```

---

## Task 17: Create Package Metadata

**Files:**
- Create: `knowledge/package.json`

**Step 1: Write package.json**

```json
{
  "name": "claude-knowledge-plugin",
  "version": "0.1.0",
  "description": "选择性知识索引系统 - 跨会话知识管理与按需检索",
  "main": "scripts/config.js",
  "scripts": {
    "test": "node --test scripts/**/*.test.js"
  },
  "keywords": [
    "claude",
    "claude-code",
    "knowledge",
    "memory",
    "index"
  ],
  "author": "conghuang",
  "license": "MIT"
}
```

**Step 2: Commit**

```bash
git add knowledge/package.json
git commit -m "feat(knowledge): add package.json"
```

---

## Summary

This implementation plan creates a complete knowledge index plugin with:

1. **Plugin structure** - Proper Claude Code plugin layout
2. **Configuration management** - User-configurable preferences
3. **Storage system** - User-level and project-level knowledge bases
4. **Change detection** - Git-based file change monitoring
5. **Importance analysis** - Scoring and classification of knowledge
6. **Pending queue** - Managing unclassified knowledge
7. **Commands** - User interface for knowledge management
8. **Skills** - AI-invokable knowledge retrieval
9. **Hooks** - Auto-start capability
10. **Tests** - TDD approach with full test coverage
