
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro-latest"];

    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello world in one word.");
            const response = await result.response;
            console.log(`✔ Success with ${modelName}:`, response.text());
        } catch (error) {
            console.error(`✘ Error with ${modelName}:`, error.message);
        }
    }
}

testGemini();
