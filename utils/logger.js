const fs = require('fs');
const path = require('path');

const currentDir = __dirname;
const parentDir = path.dirname(currentDir);

function logNotificationHistory(logMessage) {
  const logDirectory = path.join(parentDir, 'logs'); // Directory for log files
  const logFilePath = path.join(logDirectory, 'notifications_history.log'); // Path to the log file

  // Create the log directory if it doesn't exist
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const timestamp = new Date().toString().slice(0,-33);
  const formattedLog = `[${timestamp}] ${logMessage}\n`;

  fs.appendFile(logFilePath, formattedLog, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

module.exports = {
    logNotificationHistory: logNotificationHistory
};
