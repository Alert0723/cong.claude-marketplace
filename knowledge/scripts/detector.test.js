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

    fs.mkdirSync(path.join(testDir, 'src'), { recursive: true });
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
    fs.mkdirSync(path.join(testDir, 'node_modules', 'package'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'node_modules', 'package', 'test.js'), 'content');

    const changes = detector.detectChanges(testDir);
    expect(changes).toHaveLength(0);
  });
});
