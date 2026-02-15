
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const league = await prisma.league.findFirst({
        where: { apiId: "39" },
        include: { translations: { where: { languageCode: 'en' } } }
    });
    console.log('League with apiId 39:', JSON.stringify(league, null, 2));
    process.exit(0);
}
run();
