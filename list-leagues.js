
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const leagues = await prisma.league.findMany({
            include: { translations: true }
        });
        console.log('Leagues found:', leagues.length);
        leagues.forEach(l => {
            console.log(`- League ID: ${l.id}, Slugs: ${l.translations.map(t => t.slug).join(', ')}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
