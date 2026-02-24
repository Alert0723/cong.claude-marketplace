const fs = require('fs');
const path = require('path');

function checkAutoStart() {
  const configPath = path.join(__dirname, '..', 'config.json');

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

if (checkAutoStart()) {
  console.log('[Knowledge] Auto-start enabled. Use /knowledge to learn changes.');
}

module.exports = { checkAutoStart };
