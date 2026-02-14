const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-pro-latest"
    ];

    for (const modelName of models) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            console.log(`Success with ${modelName}`);
        } catch (e) {
            console.log(`${modelName} failed: ` + e.message);
        }
    }
}

checkModels();
