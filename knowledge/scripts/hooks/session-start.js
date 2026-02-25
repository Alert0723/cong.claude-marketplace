const fs = require('fs');
const path = require('path');

const { detectChanges } = require('../detector');
const { analyzeImportance } = require('../analyzer');
const { add } = require('../pending-queue');
const { load: loadConfig } = require('../config');

function getBaseDir() {
  // Try to get from environment variable first (if running as hook)
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    return path.dirname(path.dirname(path.dirname(process.env.CLAUDE_PLUGIN_ROOT)));
  }
  // Fallback to common directory structures
  const currentDir = process.cwd();
  if (fs.existsSync(path.join(currentDir, '.claude-plugin'))) {
    return currentDir;
  }
  // Try parent directories
  const parentDir = path.dirname(currentDir);
  if (fs.existsSync(path.join(parentDir, '.claude-plugin'))) {
    return parentDir;
  }
  return currentDir;
}

function checkAutoStart() {
  const configPath = path.join(__dirname, '..', '..', 'config.json');

  if (!fs.existsSync(configPath)) {
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config.autoStart === true;
  } catch (error) {
    console.warn('Failed to read config:', error.message);
    return false;
  }
}

function extractKnowledge(baseDir, config) {
  console.log('[Knowledge] Detecting changes...');

  const changes = detectChanges(baseDir);

  if (changes.length === 0) {
    console.log('[Knowledge] No changes detected.');
    return;
  }

  console.log(`[Knowledge] Detected ${changes.length} change(s).`);

  // Load existing queue for duplicate checking
  const queueDir = baseDir;  // Queue is in the same directory as baseDir
  let existingQueue = [];
  const queuePath = path.join(queueDir, 'pending-queue.json');
  if (fs.existsSync(queuePath)) {
    existingQueue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
  }

  for (const change of changes) {
    const knowledge = analyzeImportance(change);

    // Check if item with same ID already exists in queue (using add's dedup logic)
    const alreadyInQueue = existingQueue.some(item => item.id === knowledge.id);

    // Check if knowledge already learned (stored as JSON files)
    const learnedDirs = [config.userKnowledgeDir, config.projectKnowledgeDir];
    let alreadyLearned = false;
    for (const dir of learnedDirs) {
      // Resolve user home directory
      const resolvedDir = dir.replace(/^~/, process.env.HOMEDRIVE + process.env.HOMEPATH || process.env.HOME || '');
      const learnedPath = path.join(queueDir, resolvedDir, `${knowledge.id}.json`);
      if (fs.existsSync(learnedPath)) {
        alreadyLearned = true;
        break;
      }
    }

    if (!alreadyInQueue && !alreadyLearned) {
      const added = add(knowledge, queueDir);
      if (added) {
        console.log(`[Knowledge] Added to pending queue: ${knowledge.filePath} (importance: ${knowledge.importance})`);
      }
    } else if (alreadyInQueue) {
      console.log(`[Knowledge] Already in pending queue: ${knowledge.filePath}`);
    } else if (alreadyLearned) {
      console.log(`[Knowledge] Already learned: ${knowledge.filePath}`);
    }
  }

  console.log('[Knowledge] Detection complete.');
}

function main() {
  const baseDir = getBaseDir();
  const config = loadConfig();

  // Always run knowledge extraction on session start
  console.log('[Knowledge] Running extraction...');
  extractKnowledge(baseDir, config);

  // Show reminder about auto-start setting
  if (checkAutoStart()) {
    console.log('[Knowledge] Auto-start is enabled. Use /knowledge to review and learn changes.');
  } else {
    console.log('[Knowledge] Auto-start is disabled. Use /knowledge to manually review and learn changes.');
  }
}

// Run main if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { checkAutoStart, extractKnowledge, getBaseDir };
