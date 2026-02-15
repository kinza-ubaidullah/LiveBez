
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const names = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
    const leagues = await prisma.league.findMany({
        where: {
            translations: {
                some: {
                    name: { in: names, mode: 'insensitive' },
                    languageCode: 'en'
                }
            }
        },
        include: { translations: { where: { languageCode: 'en' } } }
    });
    console.log(JSON.stringify(leagues.map(l => ({ id: l.id, apiId: l.apiId, name: l.translations[0]?.name })), null, 2));
    process.exit(0);
}
run();
