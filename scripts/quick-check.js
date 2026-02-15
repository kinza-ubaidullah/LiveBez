
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const leagues = await prisma.league.findMany({ include: { translations: { where: { languageCode: 'en' } } } });
    console.log(JSON.stringify(leagues.map(l => ({ id: l.id, apiId: l.apiId, name: l.translations[0]?.name })), null, 2));
    process.exit(0);
}
run();
