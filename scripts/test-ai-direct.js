const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAiDirect() {
    console.log("Testing AI Service Direct Call...");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 5) + "...");

    const matchData = {
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        league: "La Liga",
        prediction: { winProbHome: 40, winProbDraw: 30, winProbAway: 30, bttsProb: 65, overProb: 70 },
        lang: "en"
    };

    const prompt = `Generate a deep tactical match analysis for ${matchData.homeTeam} vs ${matchData.awayTeam} in ${matchData.league}. Data: ${JSON.stringify(matchData.prediction)}. Lang: ${matchData.lang}. Return ONLY HTML.`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS! AI Response received:");
        console.log(text.substring(0, 500) + "...");
    } catch (error) {
        console.error("❌ Gemini API Error:", error.message);
        console.log("⚠️ If this fails, the system will use the localized fallbacks I implemented.");
    }
}

testAiDirect();
