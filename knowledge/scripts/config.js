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
