const { generateMatchAnalysis } = require('../lib/ai-service');
require('dotenv').config();

async function testGemini() {
    console.log('--- Testing Gemini AI Service ---');
    const matchData = {
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        league: 'La Liga',
        stats: 'Real Madrid have won 4 of their last 5. Barcelona are unbeaten in 10.',
        h2h: 'Last 5: RM 2, Barca 2, Draw 1',
        prediction: { winProbHome: 40, winProbAway: 35, winProbDraw: 25 },
        lang: 'en'
    };

    try {
        const analysis = await generateMatchAnalysis(matchData);
        console.log('SUCCESS! AI Output Sample:');
        console.log(analysis.substring(0, 500) + '...');
    } catch (e) {
        console.error('Gemini Test Failed:', e.message);
    }
}

testGemini();
