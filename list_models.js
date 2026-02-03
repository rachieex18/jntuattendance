const fetch = require('node-fetch');

async function listModels() {
    const apiKey = "AIzaSyAAB0HSoRfT13xLQ9fpmJXyNgPbAPtCnxE";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("Fetch Error:", e.message);
    }
}

listModels();
