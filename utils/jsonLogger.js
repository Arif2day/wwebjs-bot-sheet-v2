const fs = require('fs');
const path = require('path');

const {formatDate} = require('./common');

// Write JSON data to a file
function writeJSON(filePath, data,msg=`[Data Source] - berhasil dibuat!`) {
    try {
        const jsonData = JSON.stringify(data, null, 2); // Convert data to JSON string with indentation   
        fs.writeFileSync(filePath, jsonData);
        console.log(msg);
    } catch (error) {
        console.error("[Data Source] - Error writing to file:", error);
    }
}

// Read JSON data from a file
function readJSON(filePath) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf-8'); // Read file synchronously
        return JSON.parse(jsonData); // Parse JSON string to object
    } catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
}

// Usage

const filePath = path.join( __dirname,'../', 'logs/source/log_'+formatDate(Date.now(),1)+'.json');

function logFilePath() {
    return filePath;
}

module.exports = {
    writeJSON:writeJSON,
    readJSON:readJSON,
    logFilePath:logFilePath
}