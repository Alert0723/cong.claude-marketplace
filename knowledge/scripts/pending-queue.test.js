const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const queue = require('./pending-queue.js');

test('should add item to queue', (t) => {
  const testDir = path.join(os.tmpdir(), 'pending-test-' + Date.now());

  try {
    fs.mkdirSync(testDir, { recursive: true });
    const item = {
      id: 'item-1',
      summary: 'Pending item',
      importance: 0.7,
      status: 'pending'
    };

    queue.add(item, testDir);

    const all = queue.getAll(testDir);
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].id, 'item-1');
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

test('should update item status', (t) => {
  const testDir = path.join(os.tmpdir(), 'pending-test-' + Date.now());

  try {
    fs.mkdirSync(testDir, { recursive: true });
    const item = { id: 'item-1', summary: 'Test', importance: 0.5, status: 'pending' };
    queue.add(item, testDir);

    queue.updateStatus('item-1', 'classified', testDir);

    const updated = queue.getAll(testDir);
    assert.strictEqual(updated[0].status, 'classified');
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});

test('should filter items by status', (t) => {
  const testDir = path.join(os.tmpdir(), 'pending-test-' + Date.now());

  try {
    fs.mkdirSync(testDir, { recursive: true });
    queue.add({ id: 'item-1', summary: 'A', importance: 0.5, status: 'pending' }, testDir);
    queue.add({ id: 'item-2', summary: 'B', importance: 0.7, status: 'classified' }, testDir);

    const pending = queue.getByStatus('pending', testDir);
    assert.strictEqual(pending.length, 1);
    assert.strictEqual(pending[0].id, 'item-1');
  } finally {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
});
