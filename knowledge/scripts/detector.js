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
