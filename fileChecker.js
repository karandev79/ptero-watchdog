const fs = require("fs");
const path = require("path");

const config = JSON.parse(
    fs.readFileSync("./config.json", "utf-8") 
);

function scanDirectoryRecursive(dir, finding = []) {
    if (!fs.existsSync(dir)) return finding;

    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (error) {
        return finding;
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);

        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch {
            continue;
        }

        if (stat.isDirectory()) {
            scanDirectoryRecursive(fullPath, finding);
        } else {
            checkFile(file, fullPath, finding);
        }
    }
    return finding;
}

function checkFile(fileName, fullPath, finding){
    const lowerName = fileName.toLowerCase();

    for (const suspicious of config.suspiciousFiles) {
        if (lowerName.includes(suspicious.toLowerCase())) {
            finding.push({
                file: fileName,
                path: fullPath,
                matched: suspicious
            });
        }
    }
    }

    function runFileCheck() {
        const baseDir = config.scanDirectory;

        if (!fs.existsSync(baseDir)) {
            console.log(`Scan directory not found: ${baseDir}`);
            return;
        }

        console.log('Scanning Directory...');

        const results = scanDirectoryRecursive(baseDir, []);

        if (results.length == 0) {
            console.log("No Suspicious Files Found...");
            return;
        }

        console.log("Suspicious Files Detected!!!!")
        for (const res of results) {
            console.log(`File Info: \n File: ${res.file} \n File Path: ${res.path} \n Detected File: ${res.matched}`);
        }
    }

    module.exports = { runFileCheck};