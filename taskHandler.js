const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'logs', 'task.log');

async function task(user_id) {
  const logEntry = `${user_id} - task completed at - ${new Date().toISOString()}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(logEntry.trim());
}

module.exports = { task };
