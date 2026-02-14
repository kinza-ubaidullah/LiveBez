import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }
    console.log("Testing Gemini API with key...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello in one word.");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
        console.log("✅ Gemini API is working properly!");
    } catch (error: any) {
        console.error("❌ Gemini API Error:", error.message);
    }
}

testGemini();
