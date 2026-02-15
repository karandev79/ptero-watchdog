const fs = require("fs");
const path = require("path");
const seenDetections = new Set();

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

        if (stat.isDirectory() && !stat.isSymbolicLink()) {
            scanDirectoryRecursive(fullPath, finding);
        } else {
            const targetMatch = matchTargetPatterns(fullPath);
            if (targetMatch) {
                finding.push({
                    file: file,
                    path: fullPath,
                    matched: `targetPath:${targetMatch}`
                });
            }
            checkFile(file, fullPath, finding);
        }
    }
    return finding;
}

function checkFile(fileName, fullPath, finding) {
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

function matchTargetPatterns(fullPath) {
    if (!config.targetPath || !Array.isArray(config.targetPath)) return null;
    const normalized = fullPath.replace(/\\/g, "/").toLowerCase();

    for (const pattern of config.targetPath) {
        const lowerPattern = pattern.toLowerCase().replace(/^\*\//, "");
        if (normalized.endsWith(lowerPattern)) {
            return pattern;
        }
    }
    return null;
}

function runFileCheck() {
    const baseDir = config.scanDirectory;

    if (!fs.existsSync(baseDir)) {
        console.log(`Scan directory not found: ${baseDir}`);
        return;
    }

    console.log('Scanning Directory...');

    const results = [...new Map(
        scanDirectoryRecursive(baseDir, []).map(item => [item.path, item])
    ).values()];


    if (results.length === 0) {
        console.log("No Suspicious Files Found...");
        return;
    }

    console.log("Suspicious Files Detected!!!!")
    for (const res of results) {
        if (seenDetections.has(res.path)) continue;

        seenDetections.add(res.path);

        console.log(`File Info: \n File: ${res.file} \n File Path: ${res.path} \n Detected File: ${res.matched}`);
    }
}

module.exports = { runFileCheck };