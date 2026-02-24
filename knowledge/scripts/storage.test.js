const fs = require('fs');
const path = require('path');
const os = require('os');
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

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
    assert.strictEqual(fs.existsSync(filePath), true);

    const loaded = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.strictEqual(loaded.summary, 'Test knowledge');
  });

  test('should load all knowledge from directory', () => {
    const knowledge1 = { id: 'id-1', summary: 'Knowledge 1', importance: 0.5 };
    const knowledge2 = { id: 'id-2', summary: 'Knowledge 2', importance: 0.7 };

    storage.saveKnowledge(knowledge1, testDir);
    storage.saveKnowledge(knowledge2, testDir);

    const all = storage.loadAllKnowledge(testDir);
    assert.strictEqual(all.length, 2);
  });

  test('should search knowledge by query', () => {
    const knowledge1 = { id: 'id-1', summary: 'Authentication API', importance: 0.8 };
    const knowledge2 = { id: 'id-2', summary: 'Database connection', importance: 0.6 };

    storage.saveKnowledge(knowledge1, testDir);
    storage.saveKnowledge(knowledge2, testDir);

    const results = storage.searchKnowledge(testDir, 'auth');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 'id-1');
  });
});
