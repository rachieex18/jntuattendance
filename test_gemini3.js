const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI("AIzaSyAAB0HSoRfT13xLQ9fpmJXyNgPbAPtCnxE");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        console.log("Testing gemini-3-flash-preview...");
        const result = await model.generateContent("Say 'Hello from Gemini 3'");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.log("Error:", e.message);
    }
}

run();
