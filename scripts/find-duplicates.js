
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const leagues = await prisma.league.findMany({
        where: { translations: { some: { name: 'La Liga', languageCode: 'en' } } },
        include: { _count: { select: { matches: true } } }
    });
    console.log(JSON.stringify(leagues, null, 2));
    process.exit(0);
}
run();
