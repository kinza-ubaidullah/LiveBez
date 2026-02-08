
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupMockData() {
    const matches = await prisma.match.findMany({
        where: { apiSportsId: null }
    });

    console.log(`Found ${matches.length} matches without API sports ID (potential mock data).`);

    for (const match of matches) {
        console.log(`Removing potential mock match: ${match.homeTeam} vs ${match.awayTeam}`);
        // We should be careful, but the user explicitly wants NO mock data.
        // If it has no API ID, it was likely created manually or via seed.
        try {
            // Cascade delete is not default in Prisma unless specified, 
            // but we should delete translations, predictions, etc.
            await prisma.matchTranslation.deleteMany({ where: { matchId: match.id } });
            await prisma.prediction.deleteMany({ where: { matchId: match.id } });
            await prisma.match.delete({ where: { id: match.id } });
        } catch (e) {
            console.error(`Failed to delete match ${match.id}:`, e.message);
        }
    }

    console.log("Cleanup complete.");
    await prisma.$disconnect();
}

cleanupMockData();
