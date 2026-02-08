
const { generateAIAnalysisAction } = require('../lib/actions/match-actions');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAI() {
    console.log("Testing AI Analysis Generation...");

    // Find a match with API ID
    const match = await prisma.match.findFirst({
        where: { apiSportsId: { not: null } }
    });

    if (!match) {
        console.log("No match with API ID found to test AI.");
        return;
    }

    console.log(`Generating analysis for: ${match.homeTeam} vs ${match.awayTeam} (ID: ${match.id})`);

    try {
        const result = await generateAIAnalysisAction(match.id, 'en');
        console.log("AI Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("AI Action Error:", error);
    }
}

testAI().then(() => prisma.$disconnect()).then(() => process.exit(0));
