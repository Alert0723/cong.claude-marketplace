const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const detector = require('./detector.js');

test('should detect changes since last commit', (t) => {
  const testDir = path.join(os.tmpdir(), 'detector-test-' + Date.now());

  try {
    fs.mkdirSync(testDir, { recursive: true });
    execSync('git init', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: testDir, stdio: 'ignore' });

    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'src', 'test.ts'), 'initial content');
    execSync('git add . && git commit -m "initial"', { cwd: testDir, stdio: 'ignore' });

    fs.writeFileSync(path.join(testDir, 'src', 'test.ts'), 'modified content');

    const changes = detector.detectChanges(testDir);
    assert.strictEqual(changes.length, 1);
    assert.strictEqual(changes[0].filePath, 'src/test.ts');
    assert.strictEqual(changes[0].type, 'modified');
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

test('should ignore node_modules directory', (t) => {
  const testDir = path.join(os.tmpdir(), 'detector-test-' + Date.now());

  try {
    fs.mkdirSync(testDir, { recursive: true });
    execSync('git init', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: testDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: testDir, stdio: 'ignore' });

    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'src', 'test.ts'), 'initial content');
    execSync('git add . && git commit -m "initial"', { cwd: testDir, stdio: 'ignore' });

    fs.mkdirSync(path.join(testDir, 'node_modules'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'node_modules', 'package'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'node_modules', 'package', 'test.js'), 'content');

    const changes = detector.detectChanges(testDir);
    assert.strictEqual(changes.length, 0);
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});
