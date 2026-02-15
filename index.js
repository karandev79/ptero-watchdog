const fs = require("fs");
const { runFileCheck } = require("./fileChecker");

const config = JSON.parse(
    fs.readFileSync("./config.json", "utf-8")
);

console.log("Ptero WatchDog Started...");

runFileCheck();

setInterval(() => {
    runFileCheck();
}, config.setInterval);