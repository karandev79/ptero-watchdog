const fs = require("fs");
const { runFileCheck } = require("./file-checker");
const { runProcessScan } = require("./process-checker");

const config = JSON.parse(
    fs.readFileSync("./config.json", "utf-8")
);

console.log("Ptero WatchDog Started...");

runFileCheck();
runProcessScan();

// proccess running intervals
setInterval(() => {
    runFileCheck();
}, config.setInterval);

setInterval(runProcessScan, 300000);