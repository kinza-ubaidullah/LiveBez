const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        process.exit(1);
    }
    console.log("Testing Gemini API with key:", apiKey.substring(0, 5) + "...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
        console.log("✅ Gemini API is working properly!");
    } catch (error) {
        console.error("❌ Gemini API Error Details:");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("StatusText:", error.response.statusText);
        }
        process.exit(1);
    }
}

testGemini();
