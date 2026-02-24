const fs = require('fs');
const path = require('path');
const os = require('os');

describe('PendingQueue', () => {
  const testDir = path.join(os.tmpdir(), 'pending-test-' + Date.now());
  const queue = require('./pending-queue.js');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('should add item to queue', () => {
    const item = {
      id: 'item-1',
      summary: 'Pending item',
      importance: 0.7,
      status: 'pending'
    };

    queue.add(item, testDir);

    const all = queue.getAll(testDir);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('item-1');
  });

  test('should update item status', () => {
    const item = { id: 'item-1', summary: 'Test', importance: 0.5, status: 'pending' };
    queue.add(item, testDir);

    queue.updateStatus('item-1', 'classified', testDir);

    const updated = queue.getAll(testDir);
    expect(updated[0].status).toBe('classified');
  });

  test('should filter items by status', () => {
    queue.add({ id: 'item-1', summary: 'A', importance: 0.5, status: 'pending' }, testDir);
    queue.add({ id: 'item-2', summary: 'B', importance: 0.7, status: 'classified' }, testDir);

    const pending = queue.getByStatus('pending', testDir);
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('item-1');
  });
});
