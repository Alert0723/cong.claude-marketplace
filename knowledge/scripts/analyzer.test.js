const { test } = require('node:test');
const assert = require('node:assert');
const analyzer = require('./analyzer');

test('should calculate importance based on file type', () => {
  const tsFile = { filePath: 'src/api/auth.ts', type: 'modified' };
  const tsResult = analyzer.analyzeImportance(tsFile);

  assert.ok(tsResult.importance > 0);
  assert.ok(tsResult.summary);
});

test('should detect API files as more important', () => {
  const apiFile = { filePath: 'src/api/index.ts', type: 'modified' };
  const configFile = { filePath: 'config.json', type: 'modified' };

  const apiResult = analyzer.analyzeImportance(apiFile);
  const configResult = analyzer.analyzeImportance(configFile);

  assert.ok(apiResult.importance > configResult.importance);
});

test('should classify knowledge level (user/project)', () => {
  const projectFile = { filePath: 'src/components/Button.tsx', type: 'added' };
  const userFile = { filePath: '.claude/CLAUDE.md', type: 'modified' };

  const projectResult = analyzer.analyzeImportance(projectFile);
  const userResult = analyzer.analyzeImportance(userFile);

  assert.strictEqual(projectResult.level, 'project');
  assert.strictEqual(userResult.level, 'user');
});
