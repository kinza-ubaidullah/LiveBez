
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        // 1. Fix EPL
        await prisma.league.update({
            where: { id: 'cmlf6fttx000su0j8j51qb65t' },
            data: { apiId: '39' }
        });
        console.log('✅ Updated Premier League apiId to 39');

        // 2. Check for other null ones that should have IDs
        const mappings = {
            'La Liga': '140',
            'Bundesliga': '78',
            'Serie A': '135',
            'Ligue 1': '61'
        };

        for (const [name, apiId] of Object.entries(mappings)) {
            const league = await prisma.league.findFirst({
                where: {
                    translations: { some: { name, languageCode: 'en' } },
                    apiId: null
                }
            });
            if (league) {
                await prisma.league.update({
                    where: { id: league.id },
                    data: { apiId }
                });
                console.log(`✅ Fixed ${name} with apiId ${apiId}`);
            }
        }

    } catch (e) {
        console.error('Fix failed:', e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}
run();
