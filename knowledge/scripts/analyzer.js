const path = require('path');
const crypto = require('crypto');

const FILE_IMPORTANCE = {
  '.ts': 0.8,
  '.tsx': 0.75,
  '.js': 0.7,
  '.jsx': 0.65,
  '.json': 0.5,
  '.yaml': 0.5,
  '.yml': 0.5,
  '.toml': 0.5,
  '.md': 0.3,
  '.txt': 0.2,
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

function generateId(filePath, timestamp) {
  // Generate ID based on file path and timestamp for deduplication
  const hash = crypto.createHash('md5').update(filePath + timestamp).digest('hex').substring(0, 8);
  return `${path.basename(filePath)}-${hash}`;
}

function analyzeImportance(change) {
  const ext = path.extname(change.filePath);
  const dirName = path.dirname(change.filePath).toLowerCase();

  let importance = FILE_IMPORTANCE[ext] || 0.3;

  for (const [key, bonus] of Object.entries(PATH_BONUS)) {
    if (dirName.includes(key)) {
      importance += bonus;
    }
  }

  if (change.type === 'added') {
    importance += 0.1;
  }

  importance = Math.max(0, Math.min(1, importance));

  const isUserLevel = USER_LEVEL_PATHS.some(p =>
    change.filePath.toLowerCase().includes(p)
  );
  const level = isUserLevel ? 'user' : 'project';

  const fileName = path.basename(change.filePath);
  const typeLabels = {
    added: '新增',
    modified: '修改',
    deleted: '删除'
  };
  const summary = `${typeLabels[change.type]} ${fileName}`;

  const timestamp = new Date().toISOString();

  return {
    id: generateId(change.filePath, timestamp),
    importance: Number(importance.toFixed(2)),
    level,
    summary,
    filePath: change.filePath,
    changeType: change.type,
    timestamp
  };
}

function detectSimilarity(newKnowledge, existingKnowledge) {
  const pathMatch = newKnowledge.filePath === existingKnowledge.filePath;

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
