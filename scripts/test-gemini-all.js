const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini(modelName) {
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }
    console.log(`Testing Gemini API with model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log(`✅ ${modelName} Success:`, response.text());
    } catch (error) {
        console.error(`❌ ${modelName} Error:`, error.message);
    }
}

async function main() {
    await testGemini("gemini-1.5-flash");
    await testGemini("gemini-1.5-pro");
    await testGemini("gemini-pro");
}

main();
