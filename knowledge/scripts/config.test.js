const fs = require('fs');
const path = require('path');
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

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
    assert.deepStrictEqual(config, {
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
    assert.strictEqual(config.autoStart, true);
    assert.strictEqual(config.confirmBeforeLearn, false);
  });
});
