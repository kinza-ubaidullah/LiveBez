const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    try {
        // Unfortunately the direct listModels is not in the main class as a simple method in all versions
        // but we can try to fetch it via fetch if needed.
        // Actually, let's just try "gemini-pro" which is very standard.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("test");
        console.log("Gemini-pro works!");
    } catch (e) {
        console.error("Gemini-pro failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("test");
        console.log("Gemini-1.5-flash-latest works!");
    } catch (e) {
        console.error("Gemini-1.5-flash-latest failed:", e.message);
    }
}
listModels();
