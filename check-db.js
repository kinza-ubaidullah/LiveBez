
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        const matchCount = await prisma.match.count();
        const leagueCount = await prisma.league.count();
        const langCount = await prisma.language.count();
        const predictionCount = await prisma.prediction.count();

        console.log('Database Stats:');
        console.log('- Matches:', matchCount);
        console.log('- Leagues:', leagueCount);
        console.log('- Languages:', langCount);
        console.log('- Predictions:', predictionCount);

        if (matchCount > 0) {
            const latestMatch = await prisma.match.findFirst({
                orderBy: { date: 'desc' },
                select: { id: true, homeTeam: true, awayTeam: true, date: true }
            });
            console.log('Latest Match:', latestMatch);
        }
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
