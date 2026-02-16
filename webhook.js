const fs = require("fs");

const config = JSON.parse(
    fs.readFileSync("./config.json", "utf-8") // load webhook link from config file.... ;-;
);

async function sendWebhook(content) {
    if (!config.discordWebhook) return;

    try {
        await fetch(config.discordWebhook, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: content
        })
    })
} catch {}
}

module.exports = { sendWebhook }