const { execSync } = require("child_process");
const fs = require("fs");
const { sendWebhook } = require("./webhook");

const config = JSON.parse(
    fs.readFileSync("./config.json", "utf-8") // load config filee
);

const seenProcess = new Set();

function runProcessScan() {  // process scanner with keywords to detect from config file.
    if (!config.processKeywords || !Array.isArray(config.processKeywords)) {
        return;
    }

    let output;
    try {
        output = execSync("ps -u pterodactyl -o pid,user,comm,args --no-headers", {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"]
        });
    } catch {
        return;
    }

    const lines = output.split("\n");

    for (const line of lines) {
        if (!line.trim()) continue;

        const lowerLine = line.toLowerCase();

        for (const keyword of config.processKeywords) {
            const lowerKeyword = keyword.toLowerCase();

            if (!lowerLine.includes(lowerKeyword)) continue;

            const uniqueKey = line.trim();
            if (seenProcess.has(uniqueKey)) continue;

            seenProcess.add(uniqueKey);

            const parts = line.trim().split(/\s+/, 4);
            const pid = parts[0] || "unknown";
            const user = parts[1] || "unknown";

            const message = `Suspicious Process Detected
            PID: ${pid} 
            Command: ${line.trim()}
            Matched Keywords: ${keyword}`;

            console.log(message);
            sendWebhook(message);
        }
    }
}

module.exports = { runProcessScan };