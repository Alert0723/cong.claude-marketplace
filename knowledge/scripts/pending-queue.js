const fs = require('fs');
const path = require('path');

function getQueuePath(dir) {
  return path.join(dir, 'pending-queue.json');
}

function add(item, dir) {
  const queuePath = getQueuePath(dir);
  let queue = [];

  if (fs.existsSync(queuePath)) {
    queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
  }

  queue.push({
    ...item,
    addedAt: new Date().toISOString()
  });

  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
}

function getAll(dir) {
  const queuePath = getQueuePath(dir);
  if (!fs.existsSync(queuePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
}

function updateStatus(id, status, dir) {
  const queue = getAll(dir);
  const index = queue.findIndex(item => item.id === id);

  if (index !== -1) {
    queue[index].status = status;
    queue[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(getQueuePath(dir), JSON.stringify(queue, null, 2));
  }
}

function getByStatus(status, dir) {
  return getAll(dir).filter(item => item.status === status);
}

function remove(id, dir) {
  const queue = getAll(dir);
  const filtered = queue.filter(item => item.id !== id);
  fs.writeFileSync(getQueuePath(dir), JSON.stringify(filtered, null, 2));
}

module.exports = { add, getAll, updateStatus, getByStatus, remove };
