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
