const analyzer = require('./analyzer');

describe('Analyzer', () => {
  test('should calculate importance based on file type', () => {
    const tsFile = { filePath: 'src/api/auth.ts', type: 'modified' };
    const tsResult = analyzer.analyzeImportance(tsFile);

    expect(tsResult.importance).toBeGreaterThan(0);
    expect(tsResult.summary).toBeTruthy();
  });

  test('should detect API files as more important', () => {
    const apiFile = { filePath: 'src/api/index.ts', type: 'modified' };
    const configFile = { filePath: 'config.json', type: 'modified' };

    const apiResult = analyzer.analyzeImportance(apiFile);
    const configResult = analyzer.analyzeImportance(configFile);

    expect(apiResult.importance).toBeGreaterThan(configResult.importance);
  });

  test('should classify knowledge level (user/project)', () => {
    const projectFile = { filePath: 'src/components/Button.tsx', type: 'added' };
    const userFile = { filePath: '.claude/CLAUDE.md', type: 'modified' };

    const projectResult = analyzer.analyzeImportance(projectFile);
    const userResult = analyzer.analyzeImportance(userFile);

    expect(projectResult.level).toBe('project');
    expect(userResult.level).toBe('user');
  });
});
