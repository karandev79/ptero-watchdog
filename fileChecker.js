const fs = require("fs");
const path = require("path");
const { Suspense } = require("react");

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
            console.log('Scan directory not found...');
            return;
        }

        console.log('scanning directory...');

        const results = scanDirectoryRecursive(baseDir, []);

        if (results.length == 0) {
            console.log("No suspicious files found...");
            return;
        }

        console.log("suspicious files detected!!!!")
        for (const res of results) {
            console.log(`file info: \n file: ${res.file} \n file path: ${res.path} \n detected file: ${res.matched}`);
        }
    }

    module.exports = { runFileCheck};