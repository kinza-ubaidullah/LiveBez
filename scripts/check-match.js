
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const match = await prisma.match.findUnique({
        where: { id: 'cmlly8rgi00aju0hwv52q8z0h' },
        include: { league: { include: { translations: { where: { languageCode: 'en' } } } } }
    });
    console.log('Match details:', JSON.stringify(match, null, 2));
    process.exit(0);
}
run();
