
// Mocking the behavior of ai-service.ts fallback
const homeTeam = "Real Madrid";
const awayTeam = "Barcelona";
const league = "La Liga";
const prediction = { winProbHome: 40, winProbDraw: 30, winProbAway: 30 };

const getFallback = (lang) => {
    const fallbacks = {
        en: `<h2>${homeTeam} vs ${awayTeam} Prediction</h2><p>Favorites: ${homeTeam} (${prediction.winProbHome}%)</p>`,
        fa: `<h2>پیش‌بینی ${homeTeam} در مقابل ${awayTeam}</h2><p>شانس اول: ${homeTeam} (${prediction.winProbHome}٪)</p>`,
        ar: `<h2>توقعات مباراة ${homeTeam} ضد ${awayTeam}</h2><p>المرشح للفوز: ${homeTeam} (${prediction.winProbHome}٪)</p>`
    };
    return fallbacks[lang] || fallbacks.en;
};

console.log("--- ENGLISH FALLBACK ---");
console.log(getFallback('en'));
console.log("\n--- PERSIAN FALLBACK ---");
console.log(getFallback('fa'));
console.log("\n--- ARABIC FALLBACK ---");
console.log(getFallback('ar'));
