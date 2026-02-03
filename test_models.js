const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI("AIzaSyAAB0HSoRfT13xLQ9fpmJXyNgPbAPtCnxE");
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // This doesn't list models, we need the actual listModels call which might be on the genAI object or requires a different client
        console.log("Testing gemini-1.5-flash...");
        const result = await models.generateContent("Hello");
        console.log("Success with gemini-1.5-flash");
    } catch (e) {
        console.log("Error with gemini-1.5-flash:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro");
    } catch (e) {
        console.log("Error with gemini-pro:", e.message);
    }
}

run();
